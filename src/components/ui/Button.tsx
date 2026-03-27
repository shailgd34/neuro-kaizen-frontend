import React from "react";

type ButtonVariant = "primary" | "outline" | "light" | "soft" | "goldDark" | "white" | "outlineWhite";
;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "gold-gradient text-black hover:brightness-110",

  outline: "border border-[#B88746] text-[#FDF5A6] hover:bg-[#B88746]/10",

  light: "bg-gray-200 text-gray-800 hover:bg-gray-300",

  soft: "bg-[#E7D79B] text-black hover:brightness-105",

  goldDark:
    "bg-[linear-gradient(90deg,#8F5E25_0%,#FBF4A1_50%,#8F5E25_100%)] text-black hover:brightness-110",
  white: "bg-white text-black hover:bg-gray-300",
  outlineWhite: "border border-white text-white hover:bg-gray-500/10",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-6 py-3  font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
