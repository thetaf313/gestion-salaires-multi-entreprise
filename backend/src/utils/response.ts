import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  errors?: any[]
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }
  if (errors !== undefined) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

export const successResponse = <T>(
  res: Response,
  data?: T,
  message: string = "Succès",
  statusCode: number = 200
): void => {
  sendResponse(res, statusCode, message, data);
};

export const errorResponse = (
  res: Response,
  message: string = "Erreur",
  statusCode: number = 500,
  errors?: any[]
): void => {
  sendResponse(res, statusCode, message, undefined, errors);
};
