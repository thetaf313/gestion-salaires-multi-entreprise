import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  AuthResponse,
  JwtPayload,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.type.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { authRepository } from "../repositories/auth.repository.js";

class AuthService {
  private prisma = new PrismaClient();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return authRepository.login(credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { firstName, lastName, email, password, role } = credentials;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Préparer le payload JWT
    const payload: JwtPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      ...(newUser.companyId && { companyId: newUser.companyId }),
    };

    // Générer les tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Retourner la réponse
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Vérifie et décode le refreshToken (à adapter selon ta logique JWT)
    // Exemple basique :
    const payload = verifyRefreshToken(refreshToken); // À implémenter ou importer
    if (!payload) {
      throw new Error("refresh token invalide");
    }
    const accessToken = generateAccessToken(payload);
    return { accessToken };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return user;
  }
}

export const authService = new AuthService();
