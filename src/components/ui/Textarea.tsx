import React from "react";
import FormField from "./FormField";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <FormField label={label} error={error}>
      <textarea
        className={`w-full px-3 py-2 rounded-lg border
        bg-cardBg text-textPrimary
        border-borderColor
        focus:border-primary focus:ring-2 focus:ring-primary/30
        outline-none transition resize-none ${className}`}
        {...props}
      />
    </FormField>
  );
}