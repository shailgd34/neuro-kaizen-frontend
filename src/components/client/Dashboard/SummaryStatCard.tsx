import { Brain, Target, Activity } from "lucide-react";

interface SummaryStatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon?: "brain" | "target" | "activity";
  onClick?: () => void;
}

export default function SummaryStatCard({
  title,
  value,
  subtitle,
  icon = "activity",
  onClick,
}: SummaryStatCardProps) {
  const Icon = icon === "brain" ? Brain : icon === "target" ? Target : Activity;
  
  // Clean, consistent colors using the secondary gold where appropriate
  const iconClasses = icon === "brain" 
    ? "text-secondary bg-secondary/10 border-secondary/20" 
    : icon === "target" 
      ? "text-blue-400 bg-blue-400/10 border-blue-400/20" 
      : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-secondary/20 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-2 rounded-lg border ${iconClasses}`}>
          <Icon size={16} />
        </div>
        <h6 className="text-xs text-gray-400 font-medium tracking-tight">
          {title}
        </h6>
      </div>

      <div className="text-2xl font-bold text-white tracking-tight mb-1 relative z-10">
        {value}
      </div>

      <p className="text-[11px] text-gray-500 font-medium tracking-tight opacity-80 relative z-10">
        {subtitle}
      </p>

      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-secondary/0 group-hover:bg-secondary/20 transition-all duration-500" style={{ width: '100%' }} />
    </div>
  );
}