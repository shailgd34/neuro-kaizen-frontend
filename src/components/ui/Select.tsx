import React from "react";
import FormField from "./FormField";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <select
  value={props.value ?? ""}
  onChange={props.onChange}
  className={`w-full px-3 pr-10 py-3 border
  bg-[#0F141A] border-[#30363F]
  h-12
  hover:border-secondary
  focus:border-secondary focus:ring-2 focus:ring-primary/30
  outline-none transition
  appearance-none
  ${!props.value ? "text-gray-400" : "text-white"}
  ${className}`}
>
          <option value="" disabled className="text-gray-400">
            {placeholder || "Select option"}
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </FormField>
  );
}
