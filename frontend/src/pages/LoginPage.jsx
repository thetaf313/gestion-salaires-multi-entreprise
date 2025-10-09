import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AnimatedButton } from "../components/ui/animated-button";
import { AnimatedInput } from "../components/ui/animated-input";
import { AnimatedCard } from "../components/ui/animated-card";
import { AnimatedBackground } from "../components/ui/animated-background";
import { ParticlesBackground } from "../components/ui/particles-background";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle, Sparkles, Infinity } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#212121]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Arrière-plan avec particules */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <ParticlesBackground />
      </div>
      
      <div className="w-full max-w-lg space-y-8 p-8 relative z-10">
        {/* Header animé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              type: "spring",
              stiffness: 100
            }}
            className="flex items-center justify-center mb-6"
          >
            <Infinity className="h-10 w-10 text-[#212121] mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#212121] to-[#aaaaac] bg-clip-text text-transparent">
              Synergy Pay
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 text-lg"
          >
            Connectez-vous à votre compte
          </motion.p>
        </motion.div>

        {/* Formulaire de connexion */}
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="text-[#212121]">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Affichage des erreurs avec animation */}
              <AnimatePresence>
                {formErrors.global && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{formErrors.global}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-[#212121]">Email</Label>
                <AnimatedInput
                  id="email"
                  name="email"
                  type="text"
                  placeholder="vous@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  error={!!formErrors.email}
                />
                <AnimatePresence>
                  {formErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm text-red-500"
                    >
                      {formErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Mot de passe */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-[#212121]">Mot de passe</Label>
                <div className="relative">
                  <AnimatedInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    error={!!formErrors.password}
                    className="pr-12"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#212121] transition-colors p-1"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {formErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm text-red-500"
                    >
                      {formErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bouton de connexion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex justify-center pt-4"
              >
                <AnimatedButton 
                  type="submit" 
                  variant="primary"
                  className="w-full max-w-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </AnimatedButton>
              </motion.div>
            </form>

            {/* Lien vers inscription */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#212121] hover:text-[#aaaaac] transition-colors hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </motion.div> */}
          </CardContent>
        </AnimatedCard>

        {/* Comptes de test - optionnel */}
        {/* <AnimatedCard delay={1.7} className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm text-[#212121]">Comptes de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-gray-600">
              <p>
                <strong>SUPER_ADMIN:</strong> superadmin@synergypay.com /
                superadmin123
              </p>
              <p>
                <strong>ADMIN:</strong> admin@techsolutions.com / admin123
              </p>
              <p>
                <strong>CASHIER:</strong> cashier@synergypay.com /
                cashier123
              </p>
            </div>
          </CardContent>
        </AnimatedCard> */}
      </div>
    </div>
  );
}
