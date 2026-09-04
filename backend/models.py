"""
SQLAlchemy 2.0 ORM Models for Indian Income Tax & ITR-U Software
Covers AY 2022-23 to AY 2031-32
Fully normalized configuration and transaction models
"""

from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime,
    ForeignKey, Text, CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class AssessmentYear(Base):
    __tablename__ = "assessment_year"

    ay_id = Column(String(10), primary_key=True)  # e.g., '2024-25'
    fy_id = Column(String(10), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    default_regime = Column(String(4), nullable=False, default="NEW")
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tax_slabs = relationship("TaxSlab", back_populates="assessment_year", cascade="all, delete-orphan")
    finance_rules = relationship("FinanceActRule", back_populates="assessment_year", uselist=False)
    surcharges = relationship("SurchargeRule", back_populates="assessment_year")
    rebates = relationship("RebateRule", back_populates="assessment_year")


class FinancialYear(Base):
    __tablename__ = "financial_year"

    fy_id = Column(String(10), primary_key=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AssesseeType(Base):
    __tablename__ = "assessee_types"

    code = Column(String(20), primary_key=True)  # INDIVIDUAL, HUF, FIRM, etc.
    name = Column(String(100), nullable=False)
    description = Column(String(255))


class ResidentialStatus(Base):
    __tablename__ = "residential_status"

    code = Column(String(20), primary_key=True)  # RESIDENT, RNOR, NON_RESIDENT
    name = Column(String(100), nullable=False)
    description = Column(String(255))


class FinanceActRule(Base):
    __tablename__ = "finance_act_rules"

    rule_id = Column(Integer, primary_key=True, autoincrement=True)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id", ondelete="CASCADE"), nullable=False)
    finance_act_name = Column(String(100), nullable=False)
    standard_deduction_old = Column(Float, nullable=False, default=50000.0)
    standard_deduction_new = Column(Float, nullable=False, default=75000.0)
    rebate_87a_limit_old = Column(Float, nullable=False, default=500000.0)
    rebate_87a_max_old = Column(Float, nullable=False, default=12500.0)
    rebate_87a_limit_new = Column(Float, nullable=False, default=700000.0)
    rebate_87a_max_new = Column(Float, nullable=False, default=25000.0)
    rebate_87a_marginal_relief_new = Column(Integer, nullable=False, default=1)
    health_education_cess_rate = Column(Float, nullable=False, default=4.0)
    stcg_111a_rate = Column(Float, nullable=False, default=15.0)
    ltcg_112_rate = Column(Float, nullable=False, default=20.0)
    ltcg_112a_rate = Column(Float, nullable=False, default=10.0)
    ltcg_112a_exemption_limit = Column(Float, nullable=False, default=100000.0)
    vda_115bbh_rate = Column(Float, nullable=False, default=30.0)
    lottery_115bb_rate = Column(Float, nullable=False, default=30.0)
    interest_rate_234a = Column(Float, nullable=False, default=1.0)
    interest_rate_234b = Column(Float, nullable=False, default=1.0)
    interest_rate_234c = Column(Float, nullable=False, default=1.0)

    assessment_year = relationship("AssessmentYear", back_populates="finance_rules")


class TaxSlab(Base):
    __tablename__ = "tax_slabs"

    slab_id = Column(Integer, primary_key=True, autoincrement=True)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id", ondelete="CASCADE"), nullable=False)
    regime = Column(String(4), nullable=False)  # 'OLD' or 'NEW'
    assessee_type = Column(String(20), ForeignKey("assessee_types.code"), nullable=False)
    age_category = Column(String(20), nullable=False)  # GENERAL, SENIOR, SUPER_SENIOR, ALL
    from_amount = Column(Float, nullable=False)
    to_amount = Column(Float, nullable=True)  # None = No upper limit
    tax_rate = Column(Float, nullable=False)  # in percent (e.g. 5.0, 20.0, 30.0)
    slab_order = Column(Integer, nullable=False)

    assessment_year = relationship("AssessmentYear", back_populates="tax_slabs")


class SurchargeRule(Base):
    __tablename__ = "surcharge"

    surcharge_id = Column(Integer, primary_key=True, autoincrement=True)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id", ondelete="CASCADE"), nullable=False)
    regime = Column(String(4), nullable=False)
    assessee_type = Column(String(20), ForeignKey("assessee_types.code"), nullable=False)
    from_income = Column(Float, nullable=False)
    to_income = Column(Float, nullable=True)
    surcharge_rate = Column(Float, nullable=False)
    cap_special_rate_income = Column(Integer, default=1)
    marginal_relief_applicable = Column(Integer, default=1)

    assessment_year = relationship("AssessmentYear", back_populates="surcharges")


class RebateRule(Base):
    __tablename__ = "rebates"

    rebate_id = Column(Integer, primary_key=True, autoincrement=True)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id", ondelete="CASCADE"), nullable=False)
    section = Column(String(10), default="87A")
    regime = Column(String(4), nullable=False)
    max_income_limit = Column(Float, nullable=False)
    max_rebate_amount = Column(Float, nullable=False)
    marginal_relief_formula = Column(String(255))

    assessment_year = relationship("AssessmentYear", back_populates="rebates")


class DeductionMaster(Base):
    __tablename__ = "deduction_master"

    section_code = Column(String(20), primary_key=True)  # '80C', '80D', etc.
    title = Column(String(150), nullable=False)
    description = Column(String(255))
    eligible_in_old = Column(Integer, default=1)
    eligible_in_new = Column(Integer, default=0)
    overall_limit_parent_code = Column(String(20), nullable=True)


class DeductionLimit(Base):
    __tablename__ = "deduction_limits"

    limit_id = Column(Integer, primary_key=True, autoincrement=True)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id", ondelete="CASCADE"), nullable=False)
    section_code = Column(String(20), ForeignKey("deduction_master.section_code"), nullable=False)
    max_limit = Column(Float, nullable=True)
    conditions = Column(String(255))


class Taxpayer(Base):
    __tablename__ = "taxpayer"

    taxpayer_id = Column(Integer, primary_key=True, autoincrement=True)
    pan = Column(String(10), unique=True, nullable=False)
    aadhaar = Column(String(12))
    name = Column(String(150), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(1))  # M, F, O
    assessee_type = Column(String(20), ForeignKey("assessee_types.code"), default="INDIVIDUAL")
    residential_status = Column(String(20), ForeignKey("residential_status.code"), default="RESIDENT")
    email = Column(String(120))
    mobile = Column(String(15))
    address = Column(Text)
    is_audit_case = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    incomes = relationship("Income", back_populates="taxpayer", cascade="all, delete-orphan")
    challans = relationship("Challan", back_populates="taxpayer")
    updated_returns = relationship("UpdatedReturn", back_populates="taxpayer")


class Income(Base):
    __tablename__ = "income"

    income_id = Column(Integer, primary_key=True, autoincrement=True)
    taxpayer_id = Column(Integer, ForeignKey("taxpayer.taxpayer_id", ondelete="CASCADE"), nullable=False)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id"), nullable=False)
    selected_regime = Column(String(4), nullable=False)  # OLD or NEW
    gross_total_income = Column(Float, default=0.0)
    total_deductions = Column(Float, default=0.0)
    taxable_total_income = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    taxpayer = relationship("Taxpayer", back_populates="incomes")
    salary_record = relationship("SalaryHead", back_populates="income", uselist=False)
    house_property_records = relationship("HousePropertyHead", back_populates="income")
    business_record = relationship("BusinessHead", back_populates="income", uselist=False)
    capital_gains_record = relationship("CapitalGainsHead", back_populates="income", uselist=False)
    other_sources_record = relationship("OtherSourcesHead", back_populates="income", uselist=False)
    computations = relationship("TaxComputation", back_populates="income")


class SalaryHead(Base):
    __tablename__ = "salary"

    salary_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    basic_salary = Column(Float, default=0.0)
    dearness_allowance = Column(Float, default=0.0)
    hra_received = Column(Float, default=0.0)
    rent_paid = Column(Float, default=0.0)
    is_metro = Column(Integer, default=0)
    lta_received = Column(Float, default=0.0)
    lta_exemption = Column(Float, default=0.0)
    gratuity_received = Column(Float, default=0.0)
    gratuity_exempt = Column(Float, default=0.0)
    leave_encashment_received = Column(Float, default=0.0)
    leave_encashment_exempt = Column(Float, default=0.0)
    vrs_received = Column(Float, default=0.0)
    vrs_exempt = Column(Float, default=0.0)
    children_education_allowance = Column(Float, default=0.0)
    children_education_exempt = Column(Float, default=0.0)
    other_allowances = Column(Float, default=0.0)
    perquisites = Column(Float, default=0.0)
    professional_tax = Column(Float, default=0.0)
    standard_deduction = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)

    income = relationship("Income", back_populates="salary_record")


class HousePropertyHead(Base):
    __tablename__ = "house_property"

    hp_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    property_type = Column(String(10), nullable=False)  # SOP, LOP, DLOP
    gross_annual_value = Column(Float, default=0.0)
    municipal_taxes_paid = Column(Float, default=0.0)
    net_annual_value = Column(Float, default=0.0)
    standard_deduction_24a = Column(Float, default=0.0)
    interest_borrowed_capital_24b = Column(Float, default=0.0)
    income_from_property = Column(Float, default=0.0)

    income = relationship("Income", back_populates="house_property_records")


class BusinessHead(Base):
    __tablename__ = "business_income"

    biz_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    is_presumptive = Column(Integer, default=0)
    section_presumptive = Column(String(10), nullable=True)  # 44AD, 44ADA, 44AE
    gross_receipts_digital = Column(Float, default=0.0)
    gross_receipts_cash = Column(Float, default=0.0)
    professional_receipts = Column(Float, default=0.0)
    heavy_goods_vehicles_count = Column(Integer, default=0)
    normal_business_profit = Column(Float, default=0.0)
    depreciation = Column(Float, default=0.0)
    net_business_income = Column(Float, default=0.0)

    income = relationship("Income", back_populates="business_record")


class CapitalGainsHead(Base):
    __tablename__ = "capital_gain"

    cg_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    stcg_111a = Column(Float, default=0.0)
    stcg_normal = Column(Float, default=0.0)
    ltcg_112 = Column(Float, default=0.0)
    ltcg_112a = Column(Float, default=0.0)
    ltcg_112a_exempt = Column(Float, default=0.0)
    net_capital_gains = Column(Float, default=0.0)

    income = relationship("Income", back_populates="capital_gains_record")


class OtherSourcesHead(Base):
    __tablename__ = "other_sources"

    os_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    dividend_income = Column(Float, default=0.0)
    savings_interest = Column(Float, default=0.0)
    fd_term_interest = Column(Float, default=0.0)
    lottery_crossword_115bb = Column(Float, default=0.0)
    horse_race_winnings = Column(Float, default=0.0)
    vda_crypto_115bbh = Column(Float, default=0.0)
    foreign_income = Column(Float, default=0.0)
    other_general_income = Column(Float, default=0.0)
    net_other_sources = Column(Float, default=0.0)

    income = relationship("Income", back_populates="other_sources_record")


class Challan(Base):
    __tablename__ = "challan"

    challan_id = Column(Integer, primary_key=True, autoincrement=True)
    taxpayer_id = Column(Integer, ForeignKey("taxpayer.taxpayer_id", ondelete="CASCADE"), nullable=False)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id"), nullable=False)
    challan_type = Column(String(30), nullable=False)  # ADVANCE_TAX, SELF_ASSESSMENT, REGULAR_ASSESSMENT
    bsr_code = Column(String(7), nullable=False)
    challan_number = Column(String(10), nullable=False)
    tender_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    bank_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    taxpayer = relationship("Taxpayer", back_populates="challans")


class UpdatedReturn(Base):
    __tablename__ = "updated_return"

    itru_id = Column(Integer, primary_key=True, autoincrement=True)
    taxpayer_id = Column(Integer, ForeignKey("taxpayer.taxpayer_id", ondelete="CASCADE"), nullable=False)
    ay_id = Column(String(10), ForeignKey("assessment_year.ay_id"), nullable=False)
    original_return_status = Column(String(30), ForeignKey("return_status.status_code"), nullable=False)
    acknowledgement_no = Column(String(50))
    date_of_filing_original = Column(Date)
    filing_date_itru = Column(Date, nullable=False)
    reason_code = Column(String(10), nullable=False)
    is_eligible = Column(Integer, default=1)
    eligibility_note = Column(Text)
    months_from_ay_end = Column(Integer, nullable=False)
    additional_tax_rate = Column(Float, nullable=False)  # 25.0 or 50.0
    previous_total_income = Column(Float, default=0.0)
    revised_total_income = Column(Float, default=0.0)
    additional_income = Column(Float, default=0.0)
    previous_tax_paid = Column(Float, default=0.0)
    revised_tax_liability = Column(Float, default=0.0)
    additional_tax_liability = Column(Float, default=0.0)
    interest_234a = Column(Float, default=0.0)
    interest_234b = Column(Float, default=0.0)
    interest_234c = Column(Float, default=0.0)
    fee_234f = Column(Float, default=0.0)
    total_tax_and_interest = Column(Float, default=0.0)
    section_140b_additional_tax = Column(Float, default=0.0)
    relief_claimed = Column(Float, default=0.0)
    net_payable = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    taxpayer = relationship("Taxpayer", back_populates="updated_returns")


class TaxComputation(Base):
    __tablename__ = "tax_computation"

    computation_id = Column(Integer, primary_key=True, autoincrement=True)
    income_id = Column(Integer, ForeignKey("income.income_id", ondelete="CASCADE"), nullable=False)
    regime = Column(String(4), nullable=False)  # OLD or NEW
    gross_total_income = Column(Float, nullable=False)
    total_deductions = Column(Float, nullable=False)
    taxable_income = Column(Float, nullable=False)
    tax_on_normal_income = Column(Float, default=0.0)
    tax_on_special_income = Column(Float, default=0.0)
    gross_tax_liability = Column(Float, default=0.0)
    rebate_87a = Column(Float, default=0.0)
    tax_after_rebate = Column(Float, default=0.0)
    surcharge = Column(Float, default=0.0)
    marginal_relief_surcharge = Column(Float, default=0.0)
    health_education_cess = Column(Float, default=0.0)
    total_tax_liability = Column(Float, default=0.0)
    relief_89 = Column(Float, default=0.0)
    net_tax_liability = Column(Float, default=0.0)
    interest_234a = Column(Float, default=0.0)
    interest_234b = Column(Float, default=0.0)
    interest_234c = Column(Float, default=0.0)
    fee_234f = Column(Float, default=0.0)
    aggregate_liability = Column(Float, default=0.0)
    tds_credit = Column(Float, default=0.0)
    tcs_credit = Column(Float, default=0.0)
    advance_tax_paid = Column(Float, default=0.0)
    self_assessment_tax_paid = Column(Float, default=0.0)
    total_taxes_paid = Column(Float, default=0.0)
    net_amount_payable = Column(Float, default=0.0)
    refund_due = Column(Float, default=0.0)
    calculation_logs = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    income = relationship("Income", back_populates="computations")
