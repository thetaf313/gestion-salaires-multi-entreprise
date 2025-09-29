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
