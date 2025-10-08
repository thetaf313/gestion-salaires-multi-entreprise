import React from "react";
import { motion } from "framer-motion";
import { Card } from "./card";

const AnimatedCard = React.forwardRef(({ 
  children, 
  className = "", 
  delay = 0,
  ...props 
}, ref) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        ref={ref}
        className={`
          backdrop-blur-sm bg-white/80 border-white/20 
          shadow-xl hover:shadow-2xl 
          transition-all duration-300 ease-out
          ${className}
        `}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
});

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };