"""
FastAPI REST Application for Indian Income Tax & ITR-U Calculator
Exposes statutory tax computation, 234A/B/C interest engine, and ITR-U 139(8A) engine.
"""

from fastapi import FastAPI, HTTPException, Query, Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import sqlite3
import json

from backend.tax_engine import TaxRuleEngine

app = FastAPI(
    title="Indian Income Tax & ITR-U Calculator API",
    description="Statutory Tax Rule Engine for Income-tax Act, 1961, AY 2022-23 to AY 2031-32",
    version="3.5.0"
)

engine = TaxRuleEngine(db_path="tax_engine.sqlite3")


class SalaryInput(BaseModel):
    basic: float = 0.0
    da: float = 0.0
    hra_received: float = 0.0
    rent_paid: float = 0.0
    is_metro: bool = False
    other_allowances: float = 0.0
    prof_tax: float = 0.0


class HousePropertyInput(BaseModel):
    property_type: str = "SOP"  # SOP, LOP, DLOP
    gross_annual_value: float = 0.0
    municipal_taxes: float = 0.0
    interest_24b: float = 0.0


class BusinessInput(BaseModel):
    section: Optional[str] = None  # 44AD, 44ADA, None
    gross_receipts_digital: float = 0.0
    gross_receipts_cash: float = 0.0
    professional_receipts: float = 0.0
    normal_profit: float = 0.0


class CapitalGainsInput(BaseModel):
    stcg_111a: float = 0.0
    stcg_normal: float = 0.0
    ltcg_112: float = 0.0
    ltcg_112a: float = 0.0


class OtherSourcesInput(BaseModel):
    dividend: float = 0.0
    savings_interest: float = 0.0
    fd_interest: float = 0.0
    lottery_115bb: float = 0.0
    vda_115bbh: float = 0.0
    other_general: float = 0.0


class TaxComputationRequest(BaseModel):
    ay_id: str = Field(default="2025-26", example="2025-26")
    regime: str = Field(default="NEW", example="NEW")
    assessee_type: str = Field(default="INDIVIDUAL", example="INDIVIDUAL")
    dob: str = Field(default="1990-01-01", example="1990-01-01")
    due_date: Optional[str] = None
    filing_date: Optional[str] = None
    salary: Optional[SalaryInput] = None
    house_property: Optional[HousePropertyInput] = None
    business: Optional[BusinessInput] = None
    capital_gains: Optional[CapitalGainsInput] = None
    other_sources: Optional[OtherSourcesInput] = None
    deductions: Optional[Dict[str, float]] = Field(default_factory=dict)
    prepaid_taxes: Optional[Dict[str, float]] = Field(default_factory=dict)


class InterestCalculationRequest(BaseModel):
    ay_id: str = "2025-26"
    assessed_tax: float
    tds_tcs_credit: float = 0.0
    advance_tax_paid: float = 0.0
    self_assessment_tax: float = 0.0
    due_date: str = "2025-07-31"
    filing_date: str = "2025-10-15"
    adv_q1: float = 0.0
    adv_q2: float = 0.0
    adv_q3: float = 0.0
    adv_q4: float = 0.0


class ItruCalculationRequest(BaseModel):
    ay_id: str = "2024-25"
    filing_date: str = "2025-11-30"
    original_return_status: str = "NOT_FILED"
    previous_tax_paid: float = 0.0
    revised_tax_liability: float = 50000.0
    interest_234a: float = 1200.0
    interest_234b: float = 2400.0
    interest_234c: float = 800.0
    fee_234f: float = 1000.0
    is_loss: bool = False


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Indian Income Tax & ITR-U Calculator API", "version": "3.5.0"}


@app.get("/api/assessment-years")
def get_assessment_years():
    conn = engine.get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT ay_id, fy_id, default_regime FROM assessment_year ORDER BY ay_id ASC")
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/configuration/{ay_id}")
def get_configuration(ay_id: str):
    conn = engine.get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM finance_act_rules WHERE ay_id = ?", (ay_id,))
        rule = cur.fetchone()
        if not rule:
            raise HTTPException(status_code=404, detail="AY Configuration not found")

        cur.execute("SELECT * FROM tax_slabs WHERE ay_id = ? ORDER BY regime, slab_order", (ay_id,))
        slabs = [dict(s) for s in cur.fetchall()]

        cur.execute("SELECT * FROM surcharge WHERE ay_id = ?", (ay_id,))
        surcharges = [dict(sc) for sc in cur.fetchall()]

        return {
            "rules": dict(rule),
            "slabs": slabs,
            "surcharges": surcharges
        }
    finally:
        conn.close()


@app.post("/api/calculate-tax")
def calculate_tax(request: TaxComputationRequest):
    payload = request.dict()
    # Compute selected regime
    result_selected = engine.compute_full_tax(payload)

    # Also compute alternative regime for comparison
    alt_regime = "OLD" if request.regime == "NEW" else "NEW"
    alt_payload = payload.copy()
    alt_payload["regime"] = alt_regime
    result_alternative = engine.compute_full_tax(alt_payload)

    # Recommendation
    diff = result_selected["total_tax_liability"] - result_alternative["total_tax_liability"]
    if diff > 0:
        recommendation = f"{alt_regime} Regime is more beneficial! Saves Rs. {diff:,.2f}"
    elif diff < 0:
        recommendation = f"{request.regime} Regime is more beneficial! Saves Rs. {abs(diff):,.2f}"
    else:
        recommendation = "Both Old and New Regimes yield identical tax liability."

    return {
        "current_computation": result_selected,
        "comparison_computation": result_alternative,
        "tax_difference": abs(diff),
        "recommended_regime": alt_regime if diff > 0 else request.regime,
        "recommendation": recommendation
    }


@app.post("/api/calculate-interest")
def calculate_interest(req: InterestCalculationRequest):
    assessed_tax = max(0.0, req.assessed_tax - req.tds_tcs_credit)
    prepaid_due_date = req.advance_tax_paid + req.self_assessment_tax

    res_234a = engine.compute_interest_234a(assessed_tax, prepaid_due_date, req.due_date, req.filing_date)
    res_234b = engine.compute_interest_234b(assessed_tax, req.advance_tax_paid, req.ay_id, req.filing_date)
    res_234c = engine.compute_interest_234c(assessed_tax, req.adv_q1, req.adv_q2, req.adv_q3, req.adv_q4)

    total_interest = round(res_234a["interest"] + res_234b["interest"] + res_234c["total_interest"], 2)

    return {
        "assessed_tax": assessed_tax,
        "interest_234a": res_234a,
        "interest_234b": res_234b,
        "interest_234c": res_234c,
        "total_interest": total_interest
    }


@app.post("/api/calculate-itru")
def calculate_itru(req: ItruCalculationRequest):
    return engine.compute_itru(
        ay_id=req.ay_id,
        filing_date_str=req.filing_date,
        original_status=req.original_return_status,
        previous_tax_paid=req.previous_tax_paid,
        revised_tax_liability=req.revised_tax_liability,
        interest_234a=req.interest_234a,
        interest_234b=req.interest_234b,
        interest_234c=req.interest_234c,
        fee_234f=req.fee_234f,
        is_loss=req.is_loss
    )
