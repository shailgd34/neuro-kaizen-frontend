import React from "react";

interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Switch({ label, ...props }: SwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />

        <div
          className="w-10 h-5 bg-gray-400 rounded-full
          peer-checked:bg-primary transition"
        />

        <div
          className="absolute top-0.5 left-0.5
          w-4 h-4 bg-white rounded-full
          transition
          peer-checked:translate-x-5"
        />
      </div>

      {label && (
        <span className="text-sm text-textPrimary">
          {label}
        </span>
      )}
    </label>
  );
}