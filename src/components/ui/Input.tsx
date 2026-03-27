import React, { forwardRef, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Phone, Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showIcon?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, type = "text", className = "", showIcon = true, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const iconMap: Record<string, React.ReactNode> = {
      email: <Mail size={18} />,
      password: <Lock size={18} />,
      text: <User size={18} />,
      tel: <Phone size={18} />,
      search: <Search size={18} />,
    };

    const icon = iconMap[type];

    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full mb-3">
        {label && (
          <label className="block text-sm text-white/70 mb-2">{label}</label>
        )}

        <div
          className={`flex items-center rounded-sm border
          bg-[#0F141A] border-[#30363F]
          h-12
          transition-all duration-300 
          hover:border-secondary hover:
          focus:border-transparent focus-within:border-secondary mb-2
          ${error ? "border-red-500" : ""}`}
        >
          {showIcon && icon && <div className="pl-3 text-white/50">{icon}</div>}

          <input
            ref={ref}
            type={inputType}
            className={`flex-1 h-full bg-transparent
  ${showIcon ? "px-3" : "px-4"} text-white
  outline-none
  placeholder:text-white/50
  ${className}`}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-white/50 hover:text-white transition cursor-pointer"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
