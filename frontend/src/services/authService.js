import api from "./api";

export const authService = {
  // Connexion
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Inscription
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Récupérer le profil utilisateur
  async getProfile(token = null) {
    const config = token
      ? {
          headers: { Authorization: `Bearer ${token}` },
        }
      : {};
    const response = await api.get("/auth/profile", config);
    return response.data;
  },

  // Mettre à jour le profil
  async updateProfile(userData) {
    const response = await api.put("/auth/profile", userData);
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(passwordData) {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await api.post(
      "/auth/refresh-token",
      {},
      {
        withCredentials: true, // Pour envoyer les cookies
      }
    );
    return response.data;
  },

  // Déconnexion (côté client seulement)
  logout() {
    localStorage.removeItem("authToken");
  },
};

export default authService;
