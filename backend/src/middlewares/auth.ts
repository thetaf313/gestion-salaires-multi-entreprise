import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.js";
import { HttpStatus } from "../constants/httpStatus.js";

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔐 Auth header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("🎫 Token extracted:", token ? "✅ Found" : "❌ Missing");

    if (!token) {
      console.log("❌ Token manquant");
      return sendResponse(res, HttpStatus.UNAUTHORIZED, "Token manquant");
    }

    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET) {
      console.log("❌ ACCESS_TOKEN_SECRET non configuré");
      throw new Error("ACCESS_TOKEN_SECRET non configuré");
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    console.log("🔓 Token décodé:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id, // Correction ici: utiliser 'id' au lieu de 'userId'
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    console.log("✅ User ajouté à req:", req.user);
    next();
  } catch (error) {
    console.error("❌ Erreur de validation du token:", error);
    return sendResponse(res, HttpStatus.UNAUTHORIZED, "Token invalide");
  }
};
