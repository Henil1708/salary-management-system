// Response DTOs for the /dashboard endpoints — produced by the server's SQL
// aggregates, consumed by the client's charts. All monetary values are USD
// (normalized via the FX table, docs/TRADEOFFS.md §6).

export interface DashboardSummary {
  headcount: number;
  activeHeadcount: number;
  totalPayrollCostUsd: number;
  averageSalaryUsd: number;
  medianSalaryUsd: number;
}

export interface DimensionStat {
  key: string;
  headcount: number;
  averageSalaryUsd: number;
  medianSalaryUsd: number;
}

export interface PayBand {
  jobLevel: string;
  headcount: number;
  minUsd: number;
  p25Usd: number;
  medianUsd: number;
  p75Usd: number;
  maxUsd: number;
}

export interface PayrollTrendPoint {
  /** YYYY-MM */
  month: string;
  payrollUsd: number;
}

export interface RecentChange {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  amount: number;
  currency: string;
  effectiveDate: Date | string;
  reason: string;
}
