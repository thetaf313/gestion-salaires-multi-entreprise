import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      // Vérifier si le token est valide en récupérant le profil
      const response = await authService.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      // Token invalide, le supprimer
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      setError(null); // Ne pas afficher d'erreur pour un token expiré
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      const { accessToken } = response.data;

      // Stocker le token
      localStorage.setItem("authToken", accessToken);

      // Récupérer le profil utilisateur avec le token
      const profileResponse = await authService.getProfile(accessToken);
      const userData = profileResponse.data;

      // Mettre à jour l'état
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Erreur de connexion");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isLoading: loading, // Alias pour compatibilité
    isAuthenticated,
    error,
    login,
    logout,
    updateUser,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
