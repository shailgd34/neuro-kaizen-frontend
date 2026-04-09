import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-cardBg border border-white/5 rounded-2xl p-6 shadow-sm transition-all duration-300 ${className}`}
      {...props}
    >
      {title && (
        <h6 className="mb-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black flex items-center gap-2 leading-none">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          {title}
        </h6>
      )}

      <div className="relative z-10 flex flex-col flex-1 h-full">
        {children}
      </div>
    </div>
  );
}