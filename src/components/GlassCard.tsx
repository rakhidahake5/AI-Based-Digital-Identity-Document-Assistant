import { motion } from "motion/react";
import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
  key?: React.Key;
}

export default function GlassCard({
  children,
  className = "",
  id,
  onClick,
  hoverEffect = false,
  style,
}: GlassCardProps) {
  return (
    <motion.div
      id={id}
      onClick={onClick}
      style={style}
      whileHover={hoverEffect && onClick ? { scale: 1.01, translateY: -2 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        backdrop-blur-xl 
        bg-[#121216]/80 
        border border-[#1c1c24]/90 
        rounded-2xl 
        shadow-xl shadow-black/20 
        overflow-hidden
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
