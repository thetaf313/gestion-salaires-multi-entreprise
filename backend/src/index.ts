import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import statisticsRoutes from "./routes/statistics.routes.js";
import companyRoutes from "./routes/company.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import employeeUserRoutes from "./routes/employeeUser.routes.js";
import payrunRoutes from "./routes/payrun.routes.js";
import payslipRoutes from "./routes/payslip.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import workScheduleRoutes from "./routes/workSchedule.routes.js";
import config from "./config/env.js";
import corsOptions, { corsDevOptions } from "./config/cors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = config.PORT || 3003;

// Utiliser la configuration CORS appropriée selon l'environnement
const corsConfig =
  process.env.NODE_ENV === "development" ? corsDevOptions : corsOptions;
app.use(cors(corsConfig));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques pour les uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes public
app.get("/api", (req, res) => {
  res.send("Saas Gestion Salaires Multi-Entreprise API");
});
app.use("/api/auth", authRoutes);

// Middleware d'authentification JWT intégré
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("🔐 AuthenticateToken - Auth header:", authHeader);
  console.log(
    "🎫 AuthenticateToken - Token extracted:",
    token ? "✅ Found" : "❌ Missing"
  );

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Token d'accès requis",
    });
  }

  try {
    const ACCESS_TOKEN_SECRET =
      process.env.ACCESS_TOKEN_SECRET || "default-secret";

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    console.log("🔓 AuthenticateToken - Token décodé:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
      employeeId: decoded.employeeId,
    });

    // Structurer req.user avec les propriétés attendues
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
      employeeId: decoded.employeeId,
    };

    console.log("✅ AuthenticateToken - User ajouté à req:", req.user);
    next();
  } catch (error: any) {
    console.error("❌ AuthenticateToken - Erreur:", error);
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Token invalide ou expiré",
    });
  }
};

app.use("/api/profiles", authenticateToken, userRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/stats", authenticateToken, statsRoutes);
app.use("/api/statistics", authenticateToken, statisticsRoutes);
app.use("/api/companies", authenticateToken, companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/employee-users", employeeUserRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/work-schedules", authenticateToken, workScheduleRoutes);
app.use("/api", payrunRoutes);
app.use("/api", payslipRoutes);
app.use("/api", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
