import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "../../ui/Card";

type Submission = {
  type: "baseline" | "weekly";
  week: number;
  nkpi?: number;
};

type Props = {
  submissions?: Submission[];
};

export default function PerformanceIndexCard({
  submissions = [],
}: Props) {
  const latestSubmission = [...submissions]
    .filter((s) => s.nkpi !== undefined)
    .sort((a, b) => {
        if (a.week !== b.week) return b.week - a.week;
        return a.type === "weekly" ? -1 : 1;
    })[0];

  if (!latestSubmission) {
    return (
      <Card className="flex items-center justify-center min-h-[160px] text-gray-500 italic text-sm text-center px-6">
        Telemetry available once baseline is calculated.
      </Card>
    );
  }

  const current = latestSubmission.nkpi ?? 0;
  // Compare weekly vs weekly, or weekly vs baseline
  const previous = submissions
    .filter((s) => s.nkpi !== undefined && s !== latestSubmission)
    .sort((a, b) => b.week - a.week)[0]?.nkpi ?? current;

  const delta = current - previous;

  const formattedScore = Math.round(current);
  const formattedDelta = Math.abs(delta).toFixed(1);

  // -------------------------------
  // 🔹 TREND
  // -------------------------------
  let trendLabel: string;
  let TrendIcon: any;
  let trendColor: string;
  let trendBg: string;

  if (delta > 0.5) {
    trendLabel = "Improving";
    TrendIcon = TrendingUp;
    trendColor = "text-emerald-400";
    trendBg = "bg-emerald-500/10";
  } else if (delta < -0.5) {
    trendLabel = "Declining";
    TrendIcon = TrendingDown;
    trendColor = "text-rose-500";
    trendBg = "bg-rose-500/10";
  } else {
    trendLabel = "Stable";
    TrendIcon = Minus;
    trendColor = "text-gray-500";
    trendBg = "bg-gray-500/10";
  }

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <Card title="Performance Index" className="relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none" />
      
      <div className="flex flex-col relative z-10">
        <div className="flex items-center gap-2 mb-4 bg-white/5 w-fit px-2.5 py-1 rounded-lg border border-white/5">
           <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
             {latestSubmission.week === 0 ? "Initial Baseline" : `Calibration Week ${latestSubmission.week}`}
           </p>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <h4 className="text-5xl font-bold text-white tracking-tight">
            {formattedScore}
          </h4>
          <div className={`flex items-center gap-1 font-bold text-xs ${trendColor} bg-white/5 px-2 py-0.5 rounded-lg border border-white/5`}>
             {delta > 0 ? "+" : delta < 0 ? "-" : ""}{formattedDelta}
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-white/5 ${trendBg} ${trendColor} text-xs font-bold w-fit`}>
          <TrendIcon size={14} />
          {trendLabel}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">
          Neural-HUD Telemetry
        </p>
        <span className="text-[10px] text-secondary font-bold">NK-PID ACTIVE</span>
      </div>
    </Card>
  );
}