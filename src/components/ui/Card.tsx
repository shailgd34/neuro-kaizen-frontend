import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-[#0F1720] border border-[#2A3441] rounded-sm p-6 shadow-sm ${className}`}
    >
      {title && (
        <h6 className="mb-4 text-lg font-semibold text-gray-400">
          {title}
        </h6>
      )}

      {children}
    </div>
  );
}