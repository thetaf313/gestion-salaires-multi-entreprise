import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { email } from "zod";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    global: "",
    email: "",
    password: "",
  });
  // Rediriger si déjà connecté
  useEffect(() => {
    console.log("🔍 Vérification de l'état d'authentification:", {
      isAuthenticated,
      isLoading,
    });
    if (isAuthenticated && !isLoading) {
      console.log(
        "✅ Utilisateur déjà connecté, redirection vers dashboard..."
      );
      // Redirection immédiate vers le dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Nettoyer les erreurs au montage
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ global: "", email: "", password: "" });
    setIsSubmitting(true);
    console.log("🚀 Soumission du formulaire de connexion...");

    // Validation simple
    let hasErrors = false;
    if (!formData.email) {
      setFormErrors((prev) => ({
        ...prev,
        email: "l'email est requis",
      }));
      hasErrors = true;
    }

    if (!formData.password) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Le mot de passe est requis",
      }));
      hasErrors = true;
    }

    // Arrêter si il y a des erreurs de validation
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔄 Appel de la fonction login...");
      const result = await login(formData.email, formData.password);
      console.log("✅ Connexion réussie, résultat:", result);

      if (result.success) {
        console.log("🌟 Redirection immédiate vers dashboard...");
        // Redirection immédiate sans attendre l'état
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      setIsSubmitting(false);

      if (error.response && error.response.data) {
        setFormErrors((prev) => ({
          ...prev,
          global: error.response.data.message || "Erreur lors de la connexion",
          email: error.response.data.errors?.email || "",
          password: error.response.data.errors?.password || "",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          global: "Erreur de connexion au serveur",
        }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion Salaires
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Affichage des erreurs */}
              {formErrors.global && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formErrors.global}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="vous@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-destructive">{formErrors.email}</p>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <p className="text-sm text-destructive">
                    {formErrors.password}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Lien vers inscription */}
            {/* <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Comptes de test */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Comptes de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs">
              <p>
                <strong>SUPER_ADMIN:</strong> superadmin@gestion-salaires.com /
                superadmin123
              </p>
              <p>
                <strong>ADMIN:</strong> admin@techsolutions.com / admin123
              </p>
              <p>
                <strong>CASHIER:</strong> cashier@gestion-salaires.com /
                cashier123
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
