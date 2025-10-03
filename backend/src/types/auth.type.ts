import { UserRole } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string | undefined;
  employeeId?: string | undefined;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
