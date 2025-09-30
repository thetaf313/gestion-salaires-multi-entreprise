import { CorsOptions } from "cors";

// URLs autorisées pour les requêtes CORS
const allowedOrigins = [
  "http://localhost:3000", // React dev server (Create React App)
  "http://localhost:3001", // Alternative React port
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server (port alternatif)
  "http://localhost:4200", // Angular dev server
  "http://localhost:8080", // Vue dev server
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:8080",
  // Ajoute ici les URLs de production de ton frontend
  // 'https://monapp.com',
  // 'https://www.monapp.com',
];

// Configuration CORS
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (comme Postman, applications mobiles)
    if (!origin) return callback(null, true);

    // Vérifier si l'origin est dans la liste autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par la politique CORS"));
    }
  },
  credentials: true, // Permet l'envoi de cookies et headers d'authentification
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  maxAge: 86400, // Cache des options préflight pendant 24h
};

// Configuration CORS simplifiée pour le développement
export const corsDevOptions: CorsOptions = {
  origin: true, // Autorise toutes les origines en développement
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: "*",
};

export default corsOptions;
