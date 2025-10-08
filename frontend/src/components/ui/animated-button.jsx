import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";

const AnimatedButton = React.forwardRef(({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "relative overflow-hidden";
  
  // Classe pour le bouton de connexion avec la couleur #212121
  const primaryClasses = `
    bg-[#212121] hover:bg-[#2a2a2a] text-white 
    shadow-lg hover:shadow-xl 
    transition-all duration-300 ease-out
    ${baseClasses}
  `;

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={variant === "primary" ? primaryClasses : className}
        disabled={disabled}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
        
        {/* Effet de brillance au survol */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%", opacity: 0 }}
            whileHover={{ x: "100%", opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ 
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
            }}
          />
        )}
      </Button>
    </motion.div>
  );
});

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };