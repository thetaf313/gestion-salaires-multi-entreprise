import { PrismaClient } from "@prisma/client";
import {
  AuthResponse,
  JwtPayload,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.type.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

class AuthRepository {
  private prisma = new PrismaClient();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Trouver l'utilisateur avec son profil
    const user = await this.prisma.user.findUnique({
      where: { email },
      //   include: { profil: true },
    });

    if (!user) {
      throw new Error("Login ou mot de passe incorrect");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Login ou mot de passe incorrect");
    }

    // Préparer le payload JWT
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(user.companyId && { companyId: user.companyId }),
      ...(user.employeeId && { employeeId: user.employeeId }),
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

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { email, password, firstName, lastName, role } = credentials;

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
      },
    });
    return user;
  }
}

export const authRepository = new AuthRepository();
