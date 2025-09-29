import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(3003),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

const config = envSchema.parse(process.env);

export default config;
