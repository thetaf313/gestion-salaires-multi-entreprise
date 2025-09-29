import { PaymentMethod, UserRole } from "@prisma/client";

export interface SuperAdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalEmployees: number;
  totalPayrollAmount: number;
  monthlyGrowth: {
    companies: number;
    employees: number;
    payrollAmount: number;
  };
  recentActivity: {
    newCompanies: number;
    newEmployees: number;
    completedPayRuns: number;
  };
  topCompanies: Array<{
    id: string;
    name: string;
    employeeCount: number;
    monthlyPayroll: number;
  }>;
}

export interface AdminStats {
  companyId: string;
  employees: {
    total: number;
    active: number;
    newThisMonth: number;
    byContractType: Array<{
      type: string;
      count: number;
    }>;
  };
  payroll: {
    currentMonthBudget: number;
    lastMonthBudget: number;
    yearToDateBudget: number;
    averageSalary: number;
  };
  payRuns: {
    draft: number;
    approved: number;
    closed: number;
    currentMonth: number;
  };
  upcomingPayments: {
    thisWeek: number;
    nextWeek: number;
    overdue: number;
  };
}

export interface CashierStats {
  companyId: string;
  paymentsToday: {
    count: number;
    totalAmount: number;
    completed: number;
    pending: number;
  };
  paymentsThisWeek: {
    count: number;
    totalAmount: number;
  };
  paymentsThisMonth: {
    count: number;
    totalAmount: number;
  };
  payslipStatus: {
    pending: number;
    partial: number;
    paid: number;
  };
  paymentMethods: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
  }>;
  urgentPayments: Array<{
    employeeName: string;
    amount: number;
    daysOverdue: number;
  }>;
}

export type StatsResponse = SuperAdminStats | AdminStats | CashierStats;

export interface StatsRequest {
  userRole: UserRole;
  companyId?: string;
}
