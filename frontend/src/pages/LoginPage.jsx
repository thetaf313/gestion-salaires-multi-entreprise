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
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/image/loginbg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black/60"></div>
      
      {/* Ajout du bouton de retour */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 
          bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md
          border border-white/10 transition-all duration-300"
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>

      <div className="w-full max-w-lg space-y-4 p-8 relative z-10"> {/* Réduit space-y-8 à space-y-4 */}
        {/* Header avec logo */}
        <div className="text-center">  {/* Supprimé space-y-4 */}
          <div className="flex flex-col items-center">
            <img 
              src="/image/infinity.png"
              alt="Infinity companies" 
              className="h-40 w-40 -mb-4" /* Augmenté à h-40 w-40 et ajouté une marge négative */
            />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight">
              Infinity companies
            </h1>
          </div>
        </div>

        {/* Formulaire de connexion amélioré */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl p-4 transition-all duration-300 hover:bg-white/15">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-white text-center font-semibold">
              Connexion
            </CardTitle>
            <CardDescription className="text-white/80 text-center text-lg">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Affichage des erreurs amélioré */}
              {formErrors.global && (
                <div className="flex items-center gap-3 p-4 text-sm text-red-200 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-300/30 shadow-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{formErrors.global}</span>
                </div>
              )}

              {/* Email amélioré */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white text-lg font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="vous@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-12 backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 rounded-lg transition-all duration-200"
                />
                <p className="text-sm text-red-200 font-medium">{formErrors.email}</p>
              </div>

              {/* Mot de passe amélioré */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-white text-lg font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="h-12 pr-10 backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 rounded-lg transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-red-200 font-medium">{formErrors.password}</p>
              </div>

              {/* Bouton de connexion amélioré */}
              <Button
                type="submit"
                className="w-full h-12 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 font-semibold text-lg rounded-lg hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
