import { Request, Response } from "express";
import { Messages } from "../constants/messages.js";
import { authService } from "../services/auth.service.js";
import { LoginCredentials, RegisterCredentials } from "../types/auth.type.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/response.js";

class AuthController {

    async login(req: Request, res: Response) {
    try {
      const credentials: LoginCredentials = req.body;
      const authResponse = await authService.login(credentials);

      res.cookie("refreshToken", authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse(res, HttpStatus.OK, Messages.AUTH_LOGIN_SUCCESS, {
        accessToken: authResponse.accessToken,
      });
    } catch (error: any) {
      sendResponse(res, HttpStatus.UNAUTHORIZED, error.message || Messages.AUTH_LOGIN_FAILED);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const credentials: RegisterCredentials = req.body;
      const authResponse = await authService.register(credentials);

      res.cookie("refreshToken", authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse(res, HttpStatus.CREATED, Messages.AUTH_REGISTER_SUCCESS, {
        accessToken: authResponse.accessToken,
      });
    } catch (error: any) {
      sendResponse(res, HttpStatus.BAD_REQUEST, error.message || Messages.AUTH_REGISTER_FAILED);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, Messages.AUTH_REFRESH_TOKEN_MISSING);
      }

      const { accessToken } = await authService.refreshToken(refreshToken);

      sendResponse(res, HttpStatus.OK, Messages.AUTH_REFRESH_SUCCESS, { accessToken });
    } catch (error: any) {
      sendResponse(
        res,
        HttpStatus.FORBIDDEN,
        error.message || Messages.AUTH_REFRESH_FAILED
      );
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("refreshToken");
    sendResponse(res, HttpStatus.OK, Messages.AUTH_LOGOUT_SUCCESS);
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, HttpStatus.UNAUTHORIZED, Messages.AUTH_PROFILE_FAILED);
      }

      const userProfile = await authService.getProfile(userId);
      if (!userProfile) {
        return sendResponse(res, HttpStatus.NOT_FOUND, Messages.AUTH_PROFILE_NOT_FOUND);
      }

      sendResponse(res, HttpStatus.OK, Messages.AUTH_PROFILE_SUCCESS, userProfile);
    } catch (error: any) {
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message || Messages.AUTH_PROFILE_FAILED);
    }
  }
}

export const authController = new AuthController();