import React from "react";

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Checkbox({
  label,
  error,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className={`h-4 w-4 rounded border-borderColor
          text-primary focus:ring-primary/30
          transition duration-200 ${className}`}
          {...props}
        />

        {label && (
          <span className="text-sm text-textPrimary">
            {label}
          </span>
        )}
      </label>

      {error && (
        <p className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}