import axios from "axios";

// Configuration de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3003/api";

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("🔍 API Error:", error.response?.status, error.response?.data);

    // Si erreur 401, rediriger vers login sans tentative de refresh automatique
    if (error.response?.status === 401) {
      // Supprimer le token invalide
      localStorage.removeItem("authToken");

      // Rediriger vers login si pas déjà sur la page de login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
