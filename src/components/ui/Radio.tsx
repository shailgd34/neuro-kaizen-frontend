import React from "react";

interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Radio({ label, ...props }: RadioProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className="h-4 w-4 accent-primary"
        {...props}
      />
      <span className="text-textPrimary text-sm">
        {label}
      </span>
    </label>
  );
}