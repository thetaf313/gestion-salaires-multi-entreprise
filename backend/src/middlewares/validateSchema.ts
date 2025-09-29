import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateSchema =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("🔍 Debug validation - req.body:", req.body);
    console.log(
      "🔍 Debug validation - Content-Type:",
      req.headers["content-type"]
    );

    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.log("❌ Validation error:", result.error);
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      return res.status(400).json({
        success: false,
        code: res.statusCode,
        message: "Données invalides",
        // errors: result.error.issues.map((issue) => ({
        //   field: issue.path.join("."),
        //   message: issue.message,
        // })),
        errors,
      });
    }
    next();
  };

export default validateSchema;

