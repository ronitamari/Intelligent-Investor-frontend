export interface ProjectionPoint {
  year: number;
  value: number;
}

export interface SpendingPlan {
  id?: string;
  fixedCostsPercentage: number;
  guiltFreePercentage: number;
  fixedCosts: number;
  savingsGoals: number;
  activeInvestments: number;
  guiltFreeSpending: number;
  wealthProjection: ProjectionPoint[];
}

export interface CalculationResult extends SpendingPlan {
  grossSalary: number;
  bankNet: number;
  bankNetWasEstimated: boolean;
}

export interface FinancialProfile {
  id: string;
  name: string;
  grossSalary: number;
  bankNet: number;
  spendingPlans: SpendingPlan[];
}
