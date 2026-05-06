export interface TaxResult {
  taxableIncome: number;
  taxPayable: number;
  afterTaxSalary: number;
  rate: number;
  quickDeduction: number;
}

export interface TaxInput {
  salary: number;
  insurance: number;
  additionalDeductions: number;
}

export interface AnnualTaxInput {
  salary: number;
  bonus: number;
  insurance: number;
  additionalDeductions: number;
}

export interface AnnualTaxResult {
  totalComprehensiveIncome: number;
  taxableComprehensiveIncome: number;
  comprehensiveTax: number;
  occasionalTax: number;
  totalTax: number;
  averageRate: number;
}
