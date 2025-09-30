import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, Lock } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Debug logs
  console.log("🛡️ ProtectedRoute - État d'authentification:", {
    isAuthenticated,
    loading,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    pathname: location.pathname,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les permissions de rôle si spécifiées
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <p className="text-sm text-gray-500">
              Votre rôle: <span className="font-medium">{user?.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Rôles requis:{" "}
              <span className="font-medium">{allowedRoles.join(", ")}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
}
