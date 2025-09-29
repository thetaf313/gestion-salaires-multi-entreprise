import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import config from "./config/env.js";
import corsOptions, { corsDevOptions } from "./config/cors.js";

const app = express();

const PORT = config.PORT || 3003;

// Utiliser la configuration CORS appropriée selon l'environnement
const corsConfig =
  process.env.NODE_ENV === "development" ? corsDevOptions : corsOptions;
app.use(cors(corsConfig));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes public
app.get("/api", (req, res) => {
  res.send("Saas Gestion Salaires Multi-Entreprise API");
});
app.use("/api/auth", authRoutes);

// Middleware d'authentification JWT intégré
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Token d'accès requis",
    });
  }

  try {
    const ACCESS_TOKEN_SECRET =
      process.env.ACCESS_TOKEN_SECRET || "default-secret";

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Token invalide ou expiré",
    });
  }
};

app.use("/api/profiles", authenticateToken, userRoutes);
app.use("/api/stats", authenticateToken, statsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
