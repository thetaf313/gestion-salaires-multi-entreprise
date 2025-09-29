import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth.service';

// État initial
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

// Actions
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
    case authActions.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case authActions.LOGIN_SUCCESS:
    case authActions.REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        error: null,
      };

    case authActions.LOGIN_FAILURE:
    case authActions.REGISTER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload.error,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      };

    case authActions.LOAD_USER:
      return {
        ...state,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        user: action.payload.user,
      };

    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Contexte
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          if (user) {
            dispatch({
              type: authActions.LOAD_USER,
              payload: { user },
            });
          } else {
            // Token présent mais pas de données utilisateur, récupérer le profil
            const userData = await authService.getProfile();
            dispatch({
              type: authActions.LOAD_USER,
              payload: { user: userData },
            });
          }
        } else {
          dispatch({
            type: authActions.LOAD_USER,
            payload: { user: null },
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        dispatch({
          type: authActions.LOAD_USER,
          payload: { user: null },
        });
      }
    };

    loadUser();
  }, []);

  // Actions
  const login = async (credentials) => {
    console.log('🔄 Début de la connexion...');
    dispatch({ type: authActions.LOGIN_START });
    
    try {
      console.log('📡 Envoi des credentials...');
      const response = await authService.login(credentials);
      console.log('✅ Réponse de connexion reçue:', response);
      
      // Récupérer l'utilisateur (peut être vide si le profil n'a pas pu être récupéré)
      let user = authService.getCurrentUser();
      console.log('👤 Utilisateur récupéré du localStorage:', user);
      
      // Si pas d'utilisateur, essayer de récupérer le profil
      if (!user) {
        console.log('🔄 Tentative de récupération du profil...');
        try {
          user = await authService.getProfile();
          console.log('👤 Profil récupéré:', user);
        } catch (profileError) {
          console.warn('⚠️ Impossible de récupérer le profil:', profileError);
          // Continuer avec un utilisateur minimal basé sur le token
          user = { email: credentials.email };
        }
      }
      
      console.log('✅ Connexion réussie, dispatch LOGIN_SUCCESS');
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user },
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: authActions.REGISTER_START });
    
    try {
      const response = await authService.register(userData);
      const user = authService.getCurrentUser();
      
      dispatch({
        type: authActions.REGISTER_SUCCESS,
        payload: { user },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      dispatch({
        type: authActions.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: authActions.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;