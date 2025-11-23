import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}

const GlassCard = ({ children, className = "", delay = 0 }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        bg-glass backdrop-blur-xl 
        border border-glassBorder 
        shadow-2xl 
        rounded-3xl
        ${className}
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;