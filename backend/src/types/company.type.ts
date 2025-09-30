export interface CompanyResponse {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string | null;
  logo?: string | null;
  payPeriodType: "MONTHLY" | "WEEKLY" | "DAILY";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyCreateData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  currency?: string;
  logo?: string;
  payPeriodType?: "MONTHLY" | "WEEKLY" | "DAILY";
  isActive?: boolean;
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {}

export interface CompanyWithStats extends CompanyResponse {
  _count?: {
    employees: number;
    payRuns: number;
  };
}
