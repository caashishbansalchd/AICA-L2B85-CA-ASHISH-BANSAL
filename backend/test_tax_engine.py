"""
Comprehensive Test Suite for Indian Income Tax & ITR-U Calculator
Tests Old vs New Regime, 87A rebate, Surcharge & Marginal Relief,
234A/B/C interest, and ITR-U 139(8A)/140B statutory rules.
"""

import unittest
from backend.tax_engine import TaxRuleEngine


class TestTaxEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = TaxRuleEngine(db_path="tax_engine.sqlite3")

    def test_ay_2025_26_new_regime_standard_deduction_and_87a(self):
        """
        In AY 2025-26 (Budget 2024 amendments):
        Standard deduction is Rs. 75,000 for salaried employees in New Regime.
        Rebate u/s 87A is available for income up to Rs. 7,00,000 (tax is Nil).
        For Gross Salary Rs. 7,75,000:
        Net Salary = 7,75,000 - 75,000 = 7,00,000.
        Tax on 7,00,000 under slabs (0-3L Nil, 3-7L 5% of 4L = 20,000).
        Rebate 87A = 20,000 => Final Tax = 0.
        """
        payload = {
            "ay_id": "2025-26",
            "regime": "NEW",
            "assessee_type": "INDIVIDUAL",
            "dob": "1992-05-15",
            "salary": {
                "basic": 775000.0,
                "da": 0.0,
                "hra_received": 0.0,
                "other_allowances": 0.0
            }
        }
        res = self.engine.compute_full_tax(payload)
        self.assertEqual(res["taxable_total_income"], 700000.0)
        self.assertEqual(res["tax_after_rebate"], 0.0)
        self.assertEqual(res["total_tax_liability"], 0.0)

    def test_ay_2025_26_new_regime_marginal_relief_87a(self):
        """
        In AY 2025-26:
        If taxable income is Rs. 7,10,000 (exceeds Rs. 7 Lakhs by Rs. 10,000).
        Tax before rebate:
        0-3L: Nil
        3-7L: 5% of 4L = 20,000
        7-7.1L: 10% of 10,000 = 1,000
        Total slab tax = 21,000.
        Marginal relief: Tax cannot exceed excess income (Rs. 10,000).
        So rebate = 21,000 - 10,000 = 11,000.
        Tax after rebate = 10,000 + 4% cess = 10,400.
        """
        payload = {
            "ay_id": "2025-26",
            "regime": "NEW",
            "assessee_type": "INDIVIDUAL",
            "dob": "1990-01-01",
            "salary": {
                "basic": 710000.0 + 75000.0
            }
        }
        res = self.engine.compute_full_tax(payload)
        self.assertEqual(res["taxable_total_income"], 710000.0)
        self.assertEqual(res["rebate_87a"], 11000.0)
        self.assertEqual(res["tax_after_rebate"], 10000.0)
        self.assertEqual(res["total_tax_liability"], 10400.0)

    def test_old_regime_with_deductions_senior_citizen(self):
        """
        Senior citizen (age 65) in Old Regime:
        Basic exemption limit: Rs. 3,00,000.
        Standard deduction for salary: Rs. 50,000.
        80C deduction: Rs. 1,50,000.
        80TTB interest deduction: Rs. 50,000.
        """
        payload = {
            "ay_id": "2024-25",
            "regime": "OLD",
            "assessee_type": "INDIVIDUAL",
            "dob": "1958-08-10",  # Age ~65
            "salary": {
                "basic": 1000000.0
            },
            "other_sources": {
                "fd_interest": 60000.0
            },
            "deductions": {
                "80C": 150000.0,
                "80TTB": 50000.0
            }
        }
        res = self.engine.compute_full_tax(payload)
        self.assertEqual(res["age_category"], "SENIOR")
        # Net salary: 10,00,000 - 50,000 = 9,50,000
        # Other sources: 60,000
        # GTI: 10,10,000
        # Deductions: 1,50,000 (80C) + 50,000 (80TTB) = 2,00,000
        # Taxable income: 8,10,000
        self.assertEqual(res["taxable_total_income"], 810000.0)
        # Slabs for Senior:
        # 0 - 3L: Nil
        # 3L - 5L @ 5% = 10,000
        # 5L - 8.1L (3.1L) @ 20% = 62,000
        # Total tax = 72,000 + 4% cess = 74,880
        self.assertEqual(res["tax_on_normal_income"], 72000.0)
        self.assertEqual(res["total_tax_liability"], 74880.0)

    def test_interest_234a_calculation(self):
        """
        Section 234A: Return due on 2025-07-31, filed on 2025-10-15 (delay of ~3 months).
        Tax shortfall = Rs. 1,00,000.
        Interest = 1% * 3 months * 1,00,000 = Rs. 3,000.
        """
        res = self.engine.compute_interest_234a(
            assessed_tax=100000.0,
            prepaid_tax=0.0,
            due_date_str="2025-07-31",
            filing_date_str="2025-10-15"
        )
        self.assertEqual(res["months"], 3)
        self.assertEqual(res["interest"], 3000.0)

    def test_interest_234b_calculation(self):
        """
        Section 234B: Assessed tax = Rs. 2,00,000.
        Advance tax paid = Rs. 1,50,000 (which is 75%, less than 90% threshold of Rs. 1,80,000).
        Start date = 2025-04-01, payment on 2025-07-31 (~4 months).
        Shortfall = Rs. 50,000.
        Interest = 50,000 * 1% * 4 months = Rs. 2,000.
        """
        res = self.engine.compute_interest_234b(
            assessed_tax=200000.0,
            advance_tax_paid=150000.0,
            ay_id="2025-26",
            filing_date_str="2025-07-31"
        )
        self.assertTrue(res["is_defaulted"])
        self.assertEqual(res["months"], 4)
        self.assertEqual(res["interest"], 2000.0)

    def test_itru_section_139_8a_and_140b(self):
        """
        ITR-U for AY 2023-24 (ended 2024-03-31).
        Filing on 2025-01-15 (within 12 months from end of AY):
        Eligible for 25% additional tax u/s 140B.
        Additional tax liability = Rs. 40,000.
        Interests = Rs. 10,000.
        Total base = Rs. 50,000.
        Additional Tax @ 25% = Rs. 12,500.
        Net payable = Rs. 62,500.
        """
        res = self.engine.compute_itru(
            ay_id="2023-24",
            filing_date_str="2025-01-15",
            original_status="NOT_FILED",
            previous_tax_paid=0.0,
            revised_tax_liability=40000.0,
            interest_234a=5000.0,
            interest_234b=4000.0,
            interest_234c=1000.0,
            fee_234f=0.0
        )
        self.assertTrue(res["is_eligible"])
        self.assertEqual(res["additional_tax_rate"], 25.0)
        self.assertEqual(res["total_tax_and_interest"], 50000.0)
        self.assertEqual(res["section_140b_additional_tax"], 12500.0)
        self.assertEqual(res["net_payable"], 62500.0)

    def test_itru_ineligible_after_24_months(self):
        """
        AY 2022-23 ended 2023-03-31.
        Filing on 2025-09-01 (>24 months elapsed).
        Must be rejected as ineligible.
        """
        res = self.engine.compute_itru(
            ay_id="2022-23",
            filing_date_str="2025-09-01",
            original_status="NOT_FILED",
            previous_tax_paid=0.0,
            revised_tax_liability=50000.0,
            interest_234a=0.0,
            interest_234b=0.0,
            interest_234c=0.0
        )
        self.assertFalse(res["is_eligible"])
        self.assertIn("Ineligible: Exceeded statutory 24-month limit", res["eligibility_note"])

    def test_multi_year_future_support(self):
        """
        Verify future assessment year AY 2029-30 loads seamlessly from SQLite.
        """
        payload = {
            "ay_id": "2029-30",
            "regime": "NEW",
            "assessee_type": "INDIVIDUAL",
            "dob": "1995-10-20",
            "salary": {"basic": 1200000.0}
        }
        res = self.engine.compute_full_tax(payload)
        self.assertGreater(res["total_tax_liability"], 0.0)
        self.assertIn("2029-30", res["calculation_logs"])


if __name__ == "__main__":
    unittest.main()
