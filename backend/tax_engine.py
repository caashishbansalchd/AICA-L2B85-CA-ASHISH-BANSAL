"""
Indian Income Tax Statutory Rule Engine
Compliant with Income-tax Act, 1961, Finance Acts, and CBDT Rules.
Loads all slabs, rates, rebates, cess, and surcharge rules dynamically from SQLite.
Supports AY 2022-23 to AY 2031-32.
"""

import sqlite3
import math
from datetime import date, datetime
from typing import Dict, List, Any, Optional, Tuple


class TaxRuleEngine:
    def __init__(self, db_path: str = "tax_engine.sqlite3"):
        self.db_path = db_path

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_age_category(self, dob_str: str, ay_id: str) -> str:
        """
        Determines age category based on DOB and relevant financial year end date.
        General: < 60
        Senior: >= 60 and < 80
        Super Senior: >= 80
        """
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        except Exception:
            return "GENERAL"

        # e.g., for AY 2025-26, FY is 2024-25, FY end date is 2025-03-31
        start_year = int(ay_id.split("-")[0])
        fy_end = date(start_year, 3, 31)

        age = fy_end.year - dob.year - ((fy_end.month, fy_end.day) < (dob.month, dob.day))
        if age >= 80:
            return "SUPER_SENIOR"
        elif age >= 60:
            return "SENIOR"
        return "GENERAL"

    def load_finance_rules(self, conn, ay_id: str) -> Dict[str, Any]:
        cur = conn.cursor()
        cur.execute("SELECT * FROM finance_act_rules WHERE ay_id = ?", (ay_id,))
        row = cur.fetchone()
        if not row:
            # Fallback to defaults
            return {
                "standard_deduction_old": 50000.0,
                "standard_deduction_new": 75000.0,
                "rebate_87a_limit_old": 500000.0,
                "rebate_87a_max_old": 12500.0,
                "rebate_87a_limit_new": 700000.0,
                "rebate_87a_max_new": 25000.0,
                "rebate_87a_marginal_relief_new": 1,
                "health_education_cess_rate": 4.0,
                "stcg_111a_rate": 20.0 if ay_id >= "2025-26" else 15.0,
                "ltcg_112_rate": 12.5 if ay_id >= "2025-26" else 20.0,
                "ltcg_112a_rate": 12.5 if ay_id >= "2025-26" else 10.0,
                "ltcg_112a_exemption_limit": 125000.0 if ay_id >= "2025-26" else 100000.0,
                "vda_115bbh_rate": 30.0,
                "lottery_115bb_rate": 30.0,
                "interest_rate_234a": 1.0,
                "interest_rate_234b": 1.0,
                "interest_rate_234c": 1.0
            }
        return dict(row)

    def load_slabs(self, conn, ay_id: str, regime: str, assessee_type: str, age_category: str) -> List[Dict[str, Any]]:
        cur = conn.cursor()
        # Query matching slabs. If age_category is not explicitly found, fallback to 'ALL'
        cur.execute("""
            SELECT from_amount, to_amount, tax_rate, slab_order
            FROM tax_slabs
            WHERE ay_id = ? AND regime = ? AND assessee_type = ? AND age_category IN (?, 'ALL')
            ORDER BY slab_order ASC
        """, (ay_id, regime, assessee_type, age_category))
        rows = cur.fetchall()
        if not rows:
            # Fallback to Individual ALL
            cur.execute("""
                SELECT from_amount, to_amount, tax_rate, slab_order
                FROM tax_slabs
                WHERE ay_id = ? AND regime = ? AND assessee_type = 'INDIVIDUAL' AND age_category IN (?, 'ALL')
                ORDER BY slab_order ASC
            """, (ay_id, regime, age_category))
            rows = cur.fetchall()
        return [dict(r) for r in rows]

    def compute_slab_tax(self, taxable_normal_income: float, slabs: List[Dict[str, Any]]) -> Tuple[float, List[str]]:
        tax = 0.0
        logs = []
        rem_income = taxable_normal_income

        for slab in slabs:
            from_amt = slab["from_amount"]
            to_amt = slab["to_amount"]
            rate = slab["tax_rate"]

            if rem_income <= from_amt:
                continue

            taxable_in_slab = (to_amt - from_amt) if to_amt is not None else (rem_income - from_amt)
            if rem_income < (to_amt if to_amt is not None else float("inf")):
                taxable_in_slab = rem_income - from_amt

            slab_tax = round(taxable_in_slab * (rate / 100.0), 2)
            tax += slab_tax
            to_str = f"Rs. {to_amt:,.0f}" if to_amt else "Above"
            logs.append(f"Slab Rs. {from_amt:,.0f} - {to_str} @ {rate}%: On Rs. {taxable_in_slab:,.0f} = Rs. {slab_tax:,.2f}")

        return round(tax, 2), logs

    def compute_surcharge_and_marginal_relief(
        self,
        total_income: float,
        normal_tax: float,
        special_tax: float,
        regime: str,
        assessee_type: str,
        ay_id: str,
        conn
    ) -> Tuple[float, float, str]:
        """
        Computes surcharge with marginal relief and special income rate capping.
        Marginal Relief rule:
        Tax + Surcharge payable shall not exceed:
        Tax on threshold limit + (Total Income - Threshold Limit)
        """
        cur = conn.cursor()
        cur.execute("""
            SELECT from_income, to_income, surcharge_rate, cap_special_rate_income, marginal_relief_applicable
            FROM surcharge
            WHERE ay_id = ? AND regime IN (?, 'BOTH') AND assessee_type = ?
            ORDER BY from_income ASC
        """, (ay_id, regime, assessee_type))
        rows = cur.fetchall()

        matched_rate = 0.0
        threshold = 0.0
        for r in rows:
            if total_income > r["from_income"]:
                matched_rate = r["surcharge_rate"]
                threshold = r["from_income"]

        if matched_rate <= 0:
            return 0.0, 0.0, "No surcharge applicable (Total income <= Rs. 50 Lakhs)"

        total_base_tax = normal_tax + special_tax
        raw_surcharge = round(total_base_tax * (matched_rate / 100.0), 2)

        # Marginal relief calculation
        marginal_relief = 0.0
        if threshold > 0:
            # Surcharge at threshold
            threshold_cur = conn.cursor()
            threshold_cur.execute("""
                SELECT surcharge_rate FROM surcharge
                WHERE ay_id = ? AND regime IN (?, 'BOTH') AND assessee_type = ? AND to_income = ?
            """, (ay_id, regime, assessee_type, threshold))
            prior_row = threshold_cur.fetchone()
            prior_surcharge_rate = prior_row["surcharge_rate"] if prior_row else 0.0

            # Estimate tax at threshold
            # Proportionate base tax at threshold
            tax_at_threshold = total_base_tax * (threshold / total_income)
            surcharge_at_threshold = tax_at_threshold * (prior_surcharge_rate / 100.0)
            total_tax_at_threshold = tax_at_threshold + surcharge_at_threshold

            excess_income = total_income - threshold
            max_payable = total_tax_at_threshold + excess_income
            current_payable = total_base_tax + raw_surcharge

            if current_payable > max_payable:
                marginal_relief = round(current_payable - max_payable, 2)
                effective_surcharge = round(raw_surcharge - marginal_relief, 2)
                log = f"Surcharge @ {matched_rate}%: Rs. {raw_surcharge:,.2f}, less Marginal Relief: Rs. {marginal_relief:,.2f} = Rs. {effective_surcharge:,.2f}"
                return effective_surcharge, marginal_relief, log

        log = f"Surcharge @ {matched_rate}%: Rs. {raw_surcharge:,.2f}"
        return raw_surcharge, 0.0, log

    def compute_rebate_87a(
        self,
        taxable_income: float,
        normal_tax: float,
        special_tax: float,
        regime: str,
        rules: Dict[str, Any]
    ) -> Tuple[float, str]:
        """
        Computes Rebate u/s 87A:
        Old Regime: Up to Rs. 12,500 if income <= Rs. 5,00,000
        New Regime: Up to Rs. 25,000 if income <= Rs. 7,00,000
        Marginal relief under New Regime: if income between 7,00,000 and 7,27,777,
        tax cannot exceed (taxable income - 7,00,000).
        Note: Special rate income (like 112A) cannot claim 87A rebate as per judicial precedent & CBDT notifications.
        """
        eligible_tax = normal_tax  # 87A applies primarily on normal tax
        total_tax = normal_tax + special_tax

        if regime == "OLD":
            limit = rules["rebate_87a_limit_old"]
            max_rebate = rules["rebate_87a_max_old"]
            if taxable_income <= limit:
                rebate = min(eligible_tax, max_rebate)
                return rebate, f"Rebate u/s 87A: 100% tax up to Rs. {rebate:,.2f} (Income <= Rs. {limit:,.0f})"
            return 0.0, "Rebate u/s 87A not eligible (Total income > Rs. 5,00,000)"
        else:
            limit = rules["rebate_87a_limit_new"]
            max_rebate = rules["rebate_87a_max_new"]
            if taxable_income <= limit:
                rebate = min(eligible_tax, max_rebate)
                return rebate, f"Rebate u/s 87A (New Regime): Rs. {rebate:,.2f} (Income <= Rs. {limit:,.0f})"

            # Marginal relief under Section 87A in New Regime
            if rules.get("rebate_87a_marginal_relief_new", 1) and taxable_income > limit:
                excess_income = taxable_income - limit
                if normal_tax > excess_income:
                    rebate = normal_tax - excess_income
                    return round(rebate, 2), f"Marginal Relief u/s 87A (New Regime): Rs. {rebate:,.2f} (Tax capped to excess income Rs. {excess_income:,.2f})"

            return 0.0, "Rebate u/s 87A not eligible (Total income exceeds limit)"

    def count_tax_months(self, start_date: date, end_date: date) -> int:
        """
        Calculates number of months or part of a month as per Income-tax Act.
        Any fraction of a month counts as a full month.
        """
        if end_date <= start_date:
            return 0
        
        # If start_date is first of a month (like April 1)
        if start_date.day == 1:
            month_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1
            return max(1, month_diff)
        
        # For dates starting after due date (e.g., from Aug 1 following July 31 due date)
        # Calculate full 30-day periods or calendar month boundaries
        m = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
        if end_date.day >= start_date.day:
            m += 1
        return max(1, m)

    def compute_interest_234a(
        self,
        assessed_tax: float,
        prepaid_tax: float,
        due_date_str: str,
        filing_date_str: str,
        rate: float = 1.0
    ) -> Dict[str, Any]:
        """
        Section 234A: 1% per month or part of a month for delay in filing return.
        Begins on the date immediately following the due date.
        """
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        filing_date = datetime.strptime(filing_date_str, "%Y-%m-%d").date()

        if filing_date <= due_date:
            return {
                "months": 0,
                "shortfall": 0.0,
                "interest": 0.0,
                "log": "No interest u/s 234A: Return filed on or before statutory due date."
            }

        shortfall = max(0.0, assessed_tax - prepaid_tax)
        if shortfall <= 0:
            return {
                "months": 0,
                "shortfall": 0.0,
                "interest": 0.0,
                "log": "No interest u/s 234A: Total tax paid on or before due date >= assessed tax."
            }

        # Statutory month calculation
        # e.g., Due date July 31, Filing date Oct 15 -> Aug (1), Sep (2), Oct (3) = 3 months
        # If due_date is last day of month, start counting from next day
        months = (filing_date.year - due_date.year) * 12 + (filing_date.month - due_date.month)
        if filing_date.day > due_date.day or (due_date.day >= 28 and filing_date.day >= 1):
            if filing_date.month == due_date.month:
                months = 1
        months = max(1, months)

        # Round down shortfall to nearest hundred as per Rule 119A
        rounded_shortfall = math.floor(shortfall / 100.0) * 100.0
        interest = round(rounded_shortfall * (rate / 100.0) * months, 2)

        return {
            "months": months,
            "shortfall": shortfall,
            "rounded_shortfall": rounded_shortfall,
            "interest": interest,
            "log": f"Section 234A: {months} month(s) delay on Rs. {rounded_shortfall:,.0f} @ {rate}%/mo = Rs. {interest:,.2f}"
        }

    def compute_interest_234b(
        self,
        assessed_tax: float,
        advance_tax_paid: float,
        ay_id: str,
        filing_date_str: str,
        rate: float = 1.0
    ) -> Dict[str, Any]:
        """
        Section 234B: 1% per month from 1st April of AY till payment date if advance tax < 90% of assessed tax.
        """
        threshold_90 = assessed_tax * 0.90
        if advance_tax_paid >= threshold_90:
            return {
                "is_defaulted": False,
                "months": 0,
                "shortfall": 0.0,
                "interest": 0.0,
                "log": f"No 234B interest: Advance tax paid (Rs. {advance_tax_paid:,.0f}) is >= 90% of assessed tax (Rs. {threshold_90:,.0f})."
            }

        shortfall = max(0.0, assessed_tax - advance_tax_paid)
        start_year = int(ay_id.split("-")[0])
        start_date = date(start_year, 4, 1)
        payment_date = datetime.strptime(filing_date_str, "%Y-%m-%d").date()

        months = self.count_tax_months(start_date, payment_date)

        rounded_shortfall = math.floor(shortfall / 100.0) * 100.0
        interest = round(rounded_shortfall * (rate / 100.0) * months, 2)

        return {
            "is_defaulted": True,
            "months": months,
            "shortfall": shortfall,
            "rounded_shortfall": rounded_shortfall,
            "interest": interest,
            "log": f"Section 234B: Advance tax paid < 90%. Shortfall Rs. {rounded_shortfall:,.0f} for {months} month(s) @ {rate}%/mo = Rs. {interest:,.2f}"
        }

    def compute_interest_234c(
        self,
        assessed_tax: float,
        q1_paid: float,
        q2_paid: float,
        q3_paid: float,
        q4_paid: float,
        rate: float = 1.0
    ) -> Dict[str, Any]:
        """
        Section 234C: Installment-wise interest.
        Installments:
        Q1 (15 June): 15% (Buffer safe harbor 12%), 3 months @ 1% = 3%
        Q2 (15 Sept): 45% (Buffer safe harbor 36%), 3 months @ 1% = 3%
        Q3 (15 Dec): 75%, 3 months @ 1% = 3%
        Q4 (15 Mar): 100%, 1 month @ 1% = 1%
        """
        # Cumulative paid
        cum_q1 = q1_paid
        cum_q2 = q1_paid + q2_paid
        cum_q3 = q1_paid + q2_paid + q3_paid
        cum_q4 = q1_paid + q2_paid + q3_paid + q4_paid

        # Requirements
        req_q1 = assessed_tax * 0.15
        buf_q1 = assessed_tax * 0.12
        req_q2 = assessed_tax * 0.45
        buf_q2 = assessed_tax * 0.36
        req_q3 = assessed_tax * 0.75
        req_q4 = assessed_tax * 1.00

        q1_shortfall = max(0.0, req_q1 - cum_q1) if cum_q1 < buf_q1 else 0.0
        q2_shortfall = max(0.0, req_q2 - cum_q2) if cum_q2 < buf_q2 else 0.0
        q3_shortfall = max(0.0, req_q3 - cum_q3)
        q4_shortfall = max(0.0, req_q4 - cum_q4)

        int_q1 = round(math.floor(q1_shortfall / 100.0) * 100.0 * 0.03, 2)
        int_q2 = round(math.floor(q2_shortfall / 100.0) * 100.0 * 0.03, 2)
        int_q3 = round(math.floor(q3_shortfall / 100.0) * 100.0 * 0.03, 2)
        int_q4 = round(math.floor(q4_shortfall / 100.0) * 100.0 * 0.01, 2)

        total_int = round(int_q1 + int_q2 + int_q3 + int_q4, 2)

        schedule = [
            {"quarter": "Q1 (15 June)", "required_pct": "15%", "required_tax": round(req_q1, 2), "paid": cum_q1, "shortfall": round(q1_shortfall, 2), "months": 3, "interest": int_q1},
            {"quarter": "Q2 (15 Sept)", "required_pct": "45%", "required_tax": round(req_q2, 2), "paid": cum_q2, "shortfall": round(q2_shortfall, 2), "months": 3, "interest": int_q2},
            {"quarter": "Q3 (15 Dec)",  "required_pct": "75%", "required_tax": round(req_q3, 2), "paid": cum_q3, "shortfall": round(q3_shortfall, 2), "months": 3, "interest": int_q3},
            {"quarter": "Q4 (15 March)","required_pct": "100%","required_tax": round(req_q4, 2), "paid": cum_q4, "shortfall": round(q4_shortfall, 2), "months": 1, "interest": int_q4},
        ]

        return {
            "schedule": schedule,
            "total_interest": total_int,
            "log": f"Section 234C Total: Rs. {total_int:,.2f} (Q1: Rs. {int_q1:,.2f}, Q2: Rs. {int_q2:,.2f}, Q3: Rs. {int_q3:,.2f}, Q4: Rs. {int_q4:,.2f})"
        }

    def compute_itru(
        self,
        ay_id: str,
        filing_date_str: str,
        original_status: str,
        previous_tax_paid: float,
        revised_tax_liability: float,
        interest_234a: float,
        interest_234b: float,
        interest_234c: float,
        fee_234f: float = 0.0,
        is_loss: bool = False
    ) -> Dict[str, Any]:
        """
        Section 139(8A) & Section 140B Updated Return Engine:
        Time limit: 24 months from end of relevant AY.
        Additional Tax:
        - 25% if filed within 12 months from end of AY
        - 50% if filed between 12 and 24 months from end of AY
        Restrictions:
        - Cannot file for refund or increasing refund
        - Cannot file loss return
        """
        # Parse AY end date: e.g. AY 2024-25 ends on 2025-03-31
        start_year = int(ay_id.split("-")[0])
        ay_end = date(start_year + 1, 3, 31)
        filing_date = datetime.strptime(filing_date_str, "%Y-%m-%d").date()

        days_diff = (filing_date - ay_end).days
        months_from_end = math.ceil(days_diff / 30.0)

        # Eligibility checks
        if days_diff < 0:
            is_eligible = True
            months_from_end = 0
            rate = 25.0
            eligibility_note = "Filed before AY expiry (treated as 25% additional tax bracket)"
        elif months_from_end <= 12:
            is_eligible = True
            rate = 25.0
            eligibility_note = f"Eligible: Within 12 months from end of AY ({months_from_end} mos). 25% Section 140B rate applies."
        elif months_from_end <= 24:
            is_eligible = True
            rate = 50.0
            eligibility_note = f"Eligible: Between 12 and 24 months from end of AY ({months_from_end} mos). 50% Section 140B rate applies."
        else:
            is_eligible = False
            rate = 0.0
            eligibility_note = f"Ineligible: Exceeded statutory 24-month limit u/s 139(8A) ({months_from_end} mos since AY end)."

        if is_loss:
            is_eligible = False
            eligibility_note = "Ineligible: ITR-U cannot be filed to declare a loss return or enhance a loss."

        additional_tax_liability = max(0.0, revised_tax_liability - previous_tax_paid)
        base_for_140b = additional_tax_liability + interest_234a + interest_234b + interest_234c + fee_234f

        if base_for_140b <= 0 and is_eligible:
            is_eligible = False
            eligibility_note = "Ineligible: ITR-U cannot result in a refund or nil additional payable."

        additional_tax_140b = round(base_for_140b * (rate / 100.0), 2) if is_eligible else 0.0
        net_payable = round(base_for_140b + additional_tax_140b, 2) if is_eligible else 0.0

        return {
            "is_eligible": is_eligible,
            "eligibility_note": eligibility_note,
            "months_from_ay_end": months_from_end,
            "additional_tax_rate": rate,
            "additional_tax_liability": round(additional_tax_liability, 2),
            "interest_234a": round(interest_234a, 2),
            "interest_234b": round(interest_234b, 2),
            "interest_234c": round(interest_234c, 2),
            "fee_234f": round(fee_234f, 2),
            "total_tax_and_interest": round(base_for_140b, 2),
            "section_140b_additional_tax": additional_tax_140b,
            "net_payable": net_payable
        }

    def compute_full_tax(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Master calculation function orchestrating the entire statutory computation sequence.
        """
        conn = self.get_connection()
        try:
            ay_id = payload.get("ay_id", "2025-26")
            regime = payload.get("regime", "NEW")
            assessee_type = payload.get("assessee_type", "INDIVIDUAL")
            dob = payload.get("dob", "1990-01-01")
            age_category = self.get_age_category(dob, ay_id)

            rules = self.load_finance_rules(conn, ay_id)
            slabs = self.load_slabs(conn, ay_id, regime, assessee_type, age_category)

            logs = [
                f"--- Assessment Year: {ay_id} | Regime: {regime} | Assessee: {assessee_type} | Category: {age_category} ---",
                f"Rules loaded from SQLite: Standard Deduction Old=Rs.{rules['standard_deduction_old']:,.0f}, New=Rs.{rules['standard_deduction_new']:,.0f}, Cess={rules['health_education_cess_rate']}%"
            ]

            # 1. Salary Head
            sal_data = payload.get("salary", {})
            basic = sal_data.get("basic", 0.0)
            da = sal_data.get("da", 0.0)
            hra_rec = sal_data.get("hra_received", 0.0)
            rent_paid = sal_data.get("rent_paid", 0.0)
            is_metro = sal_data.get("is_metro", False)
            other_allow = sal_data.get("other_allowances", 0.0)
            prof_tax = sal_data.get("prof_tax", 0.0)

            # HRA Exemption (only in Old Regime)
            hra_exempt = 0.0
            if regime == "OLD" and hra_rec > 0 and rent_paid > 0:
                salary_for_hra = basic + da
                h1 = hra_rec
                h2 = max(0.0, rent_paid - 0.10 * salary_for_hra)
                h3 = (0.50 if is_metro else 0.40) * salary_for_hra
                hra_exempt = min(h1, h2, h3)
                logs.append(f"HRA Exemption u/s 10(13A): Rs. {hra_exempt:,.2f} (Least of Actual Rs. {h1:,.0f}, Rent-10% Rs. {h2:,.0f}, {50 if is_metro else 40}% Salary Rs. {h3:,.0f})")

            gross_salary = basic + da + hra_rec + other_allow
            std_ded = rules["standard_deduction_new"] if regime == "NEW" else rules["standard_deduction_old"]
            if gross_salary < std_ded:
                std_ded = gross_salary

            net_salary = max(0.0, gross_salary - hra_exempt - (prof_tax if regime == "OLD" else 0.0) - std_ded)
            logs.append(f"Net Salary: Gross Rs. {gross_salary:,.2f} less Std Ded Rs. {std_ded:,.2f} = Rs. {net_salary:,.2f}")

            # 2. House Property Head
            hp_data = payload.get("house_property", {})
            gav = hp_data.get("gross_annual_value", 0.0)
            muni_tax = hp_data.get("municipal_taxes", 0.0)
            hp_interest = hp_data.get("interest_24b", 0.0)
            prop_type = hp_data.get("property_type", "SOP")

            if prop_type == "SOP":
                # In New regime, SOP interest u/s 24(b) is DISALLOWED (Rs. 0).
                # In Old regime, interest u/s 24(b) is allowed up to Rs. 2 Lakhs
                if regime == "OLD":
                    allowed_interest = min(200000.0, hp_interest)
                    net_hp = -allowed_interest
                    logs.append(f"House Property (SOP): Interest u/s 24(b) allowed Rs. {net_hp:,.2f} (Old cap Rs. 2 Lakhs)")
                else:
                    net_hp = 0.0
                    logs.append(f"House Property (SOP): Interest u/s 24(b) of Rs. {hp_interest:,.2f} is DISALLOWED under New Regime (Section 115BAC)")
            else:
                nav = max(0.0, gav - muni_tax)
                std_30 = nav * 0.30
                computed_hp = nav - std_30 - hp_interest
                if regime == "OLD":
                    net_hp = max(-200000.0, computed_hp)
                    logs.append(f"House Property ({prop_type}): NAV Rs. {nav:,.2f} less 30% std ded Rs. {std_30:,.2f} less Interest Rs. {hp_interest:,.2f} = Net HP Rs. {net_hp:,.2f}")
                else:
                    # In New regime, set-off of house property loss against any other head is NOT allowed u/s 115BAC(2)(ii)
                    if computed_hp < 0:
                        net_hp = 0.0
                        logs.append(f"House Property ({prop_type}): Computed loss Rs. {computed_hp:,.2f} CANNOT be set off against other heads under Section 115BAC(2)(ii) (c/f only)")
                    else:
                        net_hp = computed_hp
                        logs.append(f"House Property ({prop_type}): Net income Rs. {net_hp:,.2f}")

            # 3. Business & Profession
            biz_data = payload.get("business", {})
            presumptive_sec = biz_data.get("section", None)
            if presumptive_sec == "44AD":
                receipts_digital = biz_data.get("gross_receipts_digital", 0.0)
                receipts_cash = biz_data.get("gross_receipts_cash", 0.0)
                net_biz = (receipts_digital * 0.06) + (receipts_cash * 0.08)
                logs.append(f"Presumptive 44AD Income: Digital Rs. {receipts_digital:,.0f} @ 6% + Cash Rs. {receipts_cash:,.0f} @ 8% = Rs. {net_biz:,.2f}")
            elif presumptive_sec == "44ADA":
                prof_rec = biz_data.get("professional_receipts", 0.0)
                net_biz = prof_rec * 0.50
                logs.append(f"Presumptive 44ADA Income: Professional receipts Rs. {prof_rec:,.0f} @ 50% = Rs. {net_biz:,.2f}")
            else:
                net_biz = biz_data.get("normal_profit", 0.0)

            # 4. Capital Gains
            cg_data = payload.get("capital_gains", {})
            stcg_111a = cg_data.get("stcg_111a", 0.0)
            stcg_normal = cg_data.get("stcg_normal", 0.0)
            ltcg_112 = cg_data.get("ltcg_112", 0.0)
            ltcg_112a_raw = cg_data.get("ltcg_112a", 0.0)

            ltcg_112a_exemption = rules["ltcg_112a_exemption_limit"]
            ltcg_112a_taxable = max(0.0, ltcg_112a_raw - ltcg_112a_exemption)
            net_cg = stcg_111a + stcg_normal + ltcg_112 + ltcg_112a_taxable
            logs.append(f"Capital Gains: STCG 111A Rs. {stcg_111a:,.0f}, LTCG 112 Rs. {ltcg_112:,.0f}, LTCG 112A Rs. {ltcg_112a_taxable:,.0f} (after exemption Rs. {ltcg_112a_exemption:,.0f})")

            # 5. Other Sources
            os_data = payload.get("other_sources", {})
            dividend = os_data.get("dividend", 0.0)
            savings_interest = os_data.get("savings_interest", 0.0)
            fd_interest = os_data.get("fd_interest", 0.0)
            lottery_115bb = os_data.get("lottery_115bb", 0.0)
            vda_115bbh = os_data.get("vda_115bbh", 0.0)
            other_gen = os_data.get("other_general", 0.0)
            net_os = dividend + savings_interest + fd_interest + lottery_115bb + vda_115bbh + other_gen

            # Gross Total Income
            gti = net_salary + net_hp + net_biz + net_cg + net_os
            logs.append(f"Gross Total Income (GTI): Rs. {gti:,.2f}")

            # 6. Deductions Chapter VI-A
            ded_data = payload.get("deductions", {})
            total_deductions = 0.0
            if regime == "OLD":
                # 80CCE umbrella: 80C + 80CCC + 80CCD(1) capped at 1.5 Lakhs
                cce_raw = ded_data.get("80C", 0.0) + ded_data.get("80CCC", 0.0) + ded_data.get("80CCD_1", 0.0)
                cce_allowed = min(150000.0, cce_raw)
                total_deductions += cce_allowed

                # 80CCD(1B): Exclusive 50k
                ccd1b = min(50000.0, ded_data.get("80CCD_1B", 0.0))
                total_deductions += ccd1b

                # 80CCD(2): Allowed in both Old and New
                ccd2 = ded_data.get("80CCD_2", 0.0)
                total_deductions += ccd2

                # 80D: Medical Insurance (up to 25k self + 25k/50k parents)
                sec_80d = min(100000.0, ded_data.get("80D", 0.0))
                total_deductions += sec_80d

                # 80TTA / 80TTB
                if age_category in ("SENIOR", "SUPER_SENIOR"):
                    ttb = min(50000.0, ded_data.get("80TTB", 0.0) or (savings_interest + fd_interest))
                    total_deductions += ttb
                else:
                    tta = min(10000.0, ded_data.get("80TTA", 0.0) or savings_interest)
                    total_deductions += tta

                # Others (80E, 80G, etc.)
                total_deductions += ded_data.get("80E", 0.0) + ded_data.get("80G", 0.0)
                logs.append(f"Chapter VI-A Deductions allowed in Old Regime: Rs. {total_deductions:,.2f}")
            else:
                # Under New Regime: ONLY 80CCD(2) is allowed
                ccd2 = ded_data.get("80CCD_2", 0.0)
                total_deductions += ccd2
                logs.append(f"New Regime: Chapter VI-A restricted. Only 80CCD(2) allowed: Rs. {total_deductions:,.2f}")

            # Deductions cannot reduce special rate incomes
            normal_income = net_salary + net_hp + net_biz + stcg_normal + dividend + savings_interest + fd_interest + other_gen
            taxable_normal_income = max(0.0, normal_income - total_deductions)
            taxable_total_income = taxable_normal_income + stcg_111a + ltcg_112 + ltcg_112a_taxable + lottery_115bb + vda_115bbh
            logs.append(f"Taxable Normal Income: Rs. {taxable_normal_income:,.2f} | Total Taxable Income: Rs. {taxable_total_income:,.2f}")

            # 7. Tax on Special Rate Incomes
            tax_stcg_111a = round(stcg_111a * (rules["stcg_111a_rate"] / 100.0), 2)
            tax_ltcg_112 = round(ltcg_112 * (rules["ltcg_112_rate"] / 100.0), 2)
            tax_ltcg_112a = round(ltcg_112a_taxable * (rules["ltcg_112a_rate"] / 100.0), 2)
            tax_lottery = round(lottery_115bb * (rules["lottery_115bb_rate"] / 100.0), 2)
            tax_vda = round(vda_115bbh * (rules["vda_115bbh_rate"] / 100.0), 2)
            total_special_tax = tax_stcg_111a + tax_ltcg_112 + tax_ltcg_112a + tax_lottery + tax_vda

            # 8. Tax on Normal Income (using SQLite Slabs)
            normal_tax, slab_logs = self.compute_slab_tax(taxable_normal_income, slabs)
            logs.extend(slab_logs)

            gross_tax = normal_tax + total_special_tax
            logs.append(f"Gross Tax: Normal Rs. {normal_tax:,.2f} + Special Rs. {total_special_tax:,.2f} = Rs. {gross_tax:,.2f}")

            # 9. Rebate u/s 87A
            rebate_87a, rebate_log = self.compute_rebate_87a(taxable_total_income, normal_tax, total_special_tax, regime, rules)
            logs.append(rebate_log)
            tax_after_rebate = max(0.0, gross_tax - rebate_87a)

            # 10. Surcharge & Marginal Relief
            surcharge, marginal_relief, surcharge_log = self.compute_surcharge_and_marginal_relief(
                taxable_total_income, tax_after_rebate, 0.0, regime, assessee_type, ay_id, conn
            )
            logs.append(surcharge_log)

            # 11. Health & Education Cess (4%)
            cess_rate = rules["health_education_cess_rate"]
            cess_amount = round((tax_after_rebate + surcharge) * (cess_rate / 100.0), 2)
            logs.append(f"Health & Education Cess @ {cess_rate}%: Rs. {cess_amount:,.2f}")

            total_tax_liability = round(tax_after_rebate + surcharge + cess_amount, 2)
            logs.append(f"Total Tax Liability: Rs. {total_tax_liability:,.2f}")

            # 12. Prepaid Taxes: TDS, TCS, Advance Tax, Self Assessment Tax
            prepaid = payload.get("prepaid_taxes", {})
            tds = prepaid.get("tds", 0.0)
            tcs = prepaid.get("tcs", 0.0)
            adv_tax = prepaid.get("advance_tax", 0.0)
            sat_tax = prepaid.get("self_assessment_tax", 0.0)
            total_prepaid = tds + tcs + adv_tax + sat_tax

            # 13. Interest u/s 234A, 234B, 234C
            due_date_filing = payload.get("due_date", f"{int(ay_id.split('-')[0])}-07-31")
            actual_filing_date = payload.get("filing_date", f"{int(ay_id.split('-')[0])}-07-31")

            assessed_tax_for_interest = max(0.0, total_tax_liability - tds - tcs)
            res_234a = self.compute_interest_234a(assessed_tax_for_interest, adv_tax + sat_tax, due_date_filing, actual_filing_date)
            res_234b = self.compute_interest_234b(assessed_tax_for_interest, adv_tax, ay_id, actual_filing_date)

            adv_q1 = prepaid.get("adv_q1", adv_tax * 0.15)
            adv_q2 = prepaid.get("adv_q2", adv_tax * 0.30)
            adv_q3 = prepaid.get("adv_q3", adv_tax * 0.30)
            adv_q4 = prepaid.get("adv_q4", adv_tax * 0.25)
            res_234c = self.compute_interest_234c(assessed_tax_for_interest, adv_q1, adv_q2, adv_q3, adv_q4)

            int_234a = res_234a["interest"]
            int_234b = res_234b["interest"]
            int_234c = res_234c["total_interest"]
            total_interest = int_234a + int_234b + int_234c

            logs.append(res_234a["log"])
            logs.append(res_234b["log"])
            logs.append(res_234c["log"])

            aggregate_liability = round(total_tax_liability + total_interest, 2)
            net_balance = aggregate_liability - total_prepaid
            net_payable = max(0.0, net_balance)
            refund_due = max(0.0, -net_balance)

            logs.append(f"Aggregate Liability: Rs. {aggregate_liability:,.2f} | Total Taxes Paid: Rs. {total_prepaid:,.2f}")
            logs.append(f"Net Amount Payable: Rs. {net_payable:,.2f} | Refund Due: Rs. {refund_due:,.2f}")

            return {
                "ay_id": ay_id,
                "regime": regime,
                "assessee_type": assessee_type,
                "age_category": age_category,
                "gross_total_income": round(gti, 2),
                "total_deductions": round(total_deductions, 2),
                "taxable_normal_income": round(taxable_normal_income, 2),
                "taxable_total_income": round(taxable_total_income, 2),
                "tax_on_normal_income": normal_tax,
                "tax_on_special_income": total_special_tax,
                "gross_tax_liability": gross_tax,
                "rebate_87a": rebate_87a,
                "tax_after_rebate": tax_after_rebate,
                "surcharge": surcharge,
                "marginal_relief_surcharge": marginal_relief,
                "health_education_cess": cess_amount,
                "total_tax_liability": total_tax_liability,
                "tds_credit": tds,
                "tcs_credit": tcs,
                "advance_tax_paid": adv_tax,
                "self_assessment_tax_paid": sat_tax,
                "total_taxes_paid": total_prepaid,
                "interest_234a": int_234a,
                "interest_234b": int_234b,
                "interest_234c": int_234c,
                "total_interest": total_interest,
                "aggregate_liability": aggregate_liability,
                "net_amount_payable": net_payable,
                "refund_due": refund_due,
                "res_234a": res_234a,
                "res_234b": res_234b,
                "res_234c": res_234c,
                "calculation_logs": "\n".join(logs)
            }
        finally:
            conn.close()
