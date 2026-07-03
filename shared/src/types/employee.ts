// API DTOs for the employee + salary endpoints — produced by the server,
// consumed by the client (blueprint rule 11: never redeclared client-side).

export interface CurrentSalary {
  amount: number;
  currency: string;
  effectiveDate: Date | string;
}

export interface EmployeeDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  countryCode: string;
  countryName: string;
  jobLevel: string;
  status: string;
  hireDate: Date | string;
  currentSalary: CurrentSalary | null;
}

export interface SalaryRecordDto {
  id: string;
  amount: number;
  currency: string;
  effectiveDate: Date | string;
  reason: string;
  isCurrent: boolean;
  createdAt: Date | string;
}
