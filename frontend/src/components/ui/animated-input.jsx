import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const AnimatedInput = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <motion.input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm",
        "transition-all duration-200 ease-in-out",
        "placeholder:text-gray-500",
        "focus:border-[#212121] focus:outline-none focus:ring-2 focus:ring-[#212121]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      whileFocus={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileHover={{ 
        borderColor: error ? '#ef4444' : '#212121',
        transition: { duration: 0.2 }
      }}
      {...props}
    />
  );
});

AnimatedInput.displayName = "AnimatedInput";