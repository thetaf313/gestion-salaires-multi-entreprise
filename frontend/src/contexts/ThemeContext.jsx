import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { companyService } from '../services/companyService';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Thèmes prédéfinis
const PREDEFINED_THEMES = {
  default: {
    name: 'Défaut',
    primary: '#212121', // Nouvelle couleur par défaut
    secondary: '#aaaaac',
  },
  blue: {
    name: 'Bleu Océan',
    primary: '#0ea5e9', // sky-500
    secondary: '#0c4a6e', // sky-900
  },
  green: {
    name: 'Vert Nature',
    primary: '#22c55e', // green-500
    secondary: '#15803d', // green-700
  },
  purple: {
    name: 'Violet Royal',
    primary: '#a855f7', // purple-500
    secondary: '#7c3aed', // violet-600
  },
  orange: {
    name: 'Orange Énergie',
    primary: '#f97316', // orange-500
    secondary: '#ea580c', // orange-600
  },
  red: {
    name: 'Rouge Passion',
    primary: '#ef4444', // red-500
    secondary: '#dc2626', // red-600
  },
  pink: {
    name: 'Rose Moderne',
    primary: '#ec4899', // pink-500
    secondary: '#be185d', // pink-700
  },
  teal: {
    name: 'Turquoise Fraîcheur',
    primary: '#14b8a6', // teal-500
    secondary: '#0f766e', // teal-700
  },
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(PREDEFINED_THEMES.default);
  const [companyTheme, setCompanyTheme] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger le thème de l'entreprise
  const loadCompanyTheme = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const response = await companyService.getMyCompany();
      const company = response.data;
      
      if (company) {
        setCompanyTheme({
          themeType: company.themeType || 'default',
          themePreset: company.themePreset,
          primaryColor: company.primaryColor,
          secondaryColor: company.secondaryColor,
        });
        
        // Appliquer le thème
        applyTheme(company);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer un thème
  const applyTheme = (themeConfig) => {
    let theme;
    
    if (themeConfig.themeType === 'preset' && themeConfig.themePreset) {
      // Thème prédéfini
      theme = PREDEFINED_THEMES[themeConfig.themePreset] || PREDEFINED_THEMES.default;
    } else if (themeConfig.themeType === 'custom' && themeConfig.primaryColor) {
      // Thème personnalisé
      theme = {
        name: 'Personnalisé',
        primary: themeConfig.primaryColor,
        secondary: themeConfig.secondaryColor || themeConfig.primaryColor,
      };
    } else {
      // Thème par défaut
      theme = PREDEFINED_THEMES.default;
    }
    
    setCurrentTheme(theme);
    
    // Appliquer les variables CSS
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    
    // Appliquer les classes Tailwind dynamiquement
    updateTailwindTheme(theme);
  };

  // Mettre à jour les classes Tailwind
  const updateTailwindTheme = (theme) => {
    // Convertir les couleurs hex en HSL pour Tailwind
    const primaryHsl = hexToHsl(theme.primary);
    const secondaryHsl = hexToHsl(theme.secondary);
    
    // Mettre à jour les variables CSS pour shadcn/ui
    const root = document.documentElement;
    root.style.setProperty('--primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    root.style.setProperty('--primary-foreground', '0 0% 98%');
  };

  // Convertir hex en HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Sauvegarder le thème de l'entreprise
  const saveCompanyTheme = async (themeConfig) => {
    try {
      setLoading(true);
      const response = await companyService.updateMyCompany(themeConfig);
      
      if (response.success) {
        setCompanyTheme(themeConfig);
        applyTheme(themeConfig);
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Charger le thème au montage et quand l'utilisateur change
  useEffect(() => {
    if (user?.companyId) {
      loadCompanyTheme();
    } else {
      // Utilisateur non connecté ou super admin - thème par défaut
      applyTheme({ themeType: 'default' });
    }
  }, [user?.companyId]);

  const value = {
    currentTheme,
    companyTheme,
    predefinedThemes: PREDEFINED_THEMES,
    loading,
    applyTheme,
    saveCompanyTheme,
    loadCompanyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;