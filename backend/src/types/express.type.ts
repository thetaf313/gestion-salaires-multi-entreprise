declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: import("@prisma/client").UserRole;
        companyId?: string;
        employeeId?: string;
      };
    }
  }
}
