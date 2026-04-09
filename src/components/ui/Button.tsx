import React from "react";

type ButtonVariant = 
  | "primary" 
  | "outline" 
  | "secondary" 
  | "soft" 
  | "goldDark" 
  | "white" 
  | "outlineWhite" 
  | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-secondary text-black hover:opacity-90 active:scale-95",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  outline: "border border-secondary/50 text-secondary hover:bg-secondary/10",
  soft: "bg-secondary/20 text-secondary hover:bg-secondary/30",
  goldDark: "bg-secondary text-black hover:opacity-90 shadow-lg shadow-secondary/10 text-black",
  white: "bg-white text-black hover:bg-gray-100",
  outlineWhite: "border border-white/20 text-white hover:bg-white/5",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 
        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
