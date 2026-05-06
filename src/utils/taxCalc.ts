import { TAX_BRACKETS, THRESHOLD, ANNUAL_TAX_BRACKETS, ANNUAL_THRESHOLD } from '../constants';
import { TaxInput, TaxResult, AnnualTaxInput, AnnualTaxResult } from '../types';

export function calculateTax(input: TaxInput): TaxResult {
  const { salary, insurance, additionalDeductions } = input;
  
  // 应纳税所得额 = 月度税前工资 - 个人缴纳五险一金 - 专项附加扣除 - 5000元（起征点）
  const taxableIncome = Math.max(0, salary - insurance - additionalDeductions - THRESHOLD);
  
  let rate = 0;
  let quickDeduction = 0;
  
  if (taxableIncome > 0) {
    for (const bracket of TAX_BRACKETS) {
      if (taxableIncome <= bracket.limit) {
        rate = bracket.rate;
        quickDeduction = bracket.quickDeduction;
        break;
      }
    }
  }
  
  // 应纳税额 = 应纳税所得额 × 适用税率 - 速算扣除数
  const taxPayable = taxableIncome * rate - quickDeduction;
  
  // 税后工资 = 月度税前工资 - 个人缴纳五险一金 - 应纳税额
  const afterTaxSalary = salary - insurance - taxPayable;
  
  return {
    taxableIncome: Number(taxableIncome.toFixed(2)),
    taxPayable: Number(taxPayable.toFixed(2)),
    afterTaxSalary: Number(afterTaxSalary.toFixed(2)),
    rate,
    quickDeduction,
  };
}

export function calculateAnnualTax(input: AnnualTaxInput): AnnualTaxResult {
  const { salary, bonus, insurance, additionalDeductions } = input;

  // 工资薪金通常从月度转化，这里假设输入的是月度工资
  const annualSalary = salary * 12;
  
  const totalComprehensiveIncome = annualSalary + bonus;
  
  // 综合所得应纳税所得额 = 年度综合所得 - 60000 - 五险一金 - 专项附加扣除
  const taxableComprehensiveIncome = Math.max(0, totalComprehensiveIncome - ANNUAL_THRESHOLD - insurance - additionalDeductions);
  
  let compRate = 0;
  let compQuickDeduction = 0;
  
  if (taxableComprehensiveIncome > 0) {
    for (const bracket of ANNUAL_TAX_BRACKETS) {
      if (taxableComprehensiveIncome <= bracket.limit) {
        compRate = bracket.rate;
        compQuickDeduction = bracket.quickDeduction;
        break;
      }
    }
  }
  
  const comprehensiveTax = taxableComprehensiveIncome * compRate - compQuickDeduction;
  
  const totalTax = comprehensiveTax;
  const averageRate = totalComprehensiveIncome > 0 ? (totalTax / totalComprehensiveIncome) * 100 : 0;
  
  return {
    totalComprehensiveIncome: Number(totalComprehensiveIncome.toFixed(2)),
    taxableComprehensiveIncome: Number(taxableComprehensiveIncome.toFixed(2)),
    comprehensiveTax: Number(comprehensiveTax.toFixed(2)),
    occasionalTax: 0,
    totalTax: Number(totalTax.toFixed(2)),
    averageRate: Number(averageRate.toFixed(2))
  };
}
