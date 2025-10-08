export interface CompanyResponse {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string | null;
  logo?: string | null;
  payPeriodType: "MONTHLY" | "WEEKLY" | "DAILY";
  
  // Champs de thème
  themeType: string;
  themePreset?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  
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
  
  // Champs de thème
  themeType?: string;
  themePreset?: string;
  primaryColor?: string;
  secondaryColor?: string;
  
  isActive?: boolean;
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {}

export interface CompanyWithStats extends CompanyResponse {
  _count?: {
    employees: number;
    payRuns: number;
  };
}
