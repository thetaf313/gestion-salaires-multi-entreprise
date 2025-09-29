import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, nettoyer le localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data.accessToken) {
        // Stocker le token
        localStorage.setItem('accessToken', response.data.data.accessToken);
        
        // Essayer de récupérer le profil utilisateur, mais ne pas bloquer si ça échoue
        try {
          const profileResponse = await api.get('/profiles/me');
          if (profileResponse.data.success) {
            localStorage.setItem('user', JSON.stringify(profileResponse.data.data));
          }
        } catch (profileError) {
          console.warn('Impossible de récupérer le profil immédiatement, sera récupéré plus tard:', profileError);
        }
        
        return response.data;
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.data.accessToken) {
        // Stocker le token
        localStorage.setItem('accessToken', response.data.data.accessToken);
        
        // Récupérer le profil utilisateur
        const profileResponse = await api.get('/profiles/me');
        if (profileResponse.data.success) {
          localStorage.setItem('user', JSON.stringify(profileResponse.data.data));
        }
        
        return response.data;
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      // Nettoyer le localStorage de toute façon
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error('Impossible de récupérer le profil');
    } catch (error) {
      console.error('Erreur de récupération du profil:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('accessToken');
  }
};

export default authService;