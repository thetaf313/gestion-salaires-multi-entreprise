import { JwtPayload } from "../types/auth.type.js";
import jwt from "jsonwebtoken";

const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '1h', // 1 hour
  });
};

const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d', // 7 days
  });
};

const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};