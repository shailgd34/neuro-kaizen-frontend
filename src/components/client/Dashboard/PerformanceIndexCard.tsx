import Card from "../../ui/Card";

type DomainScore = {
  domain: string;
  score: number;
};

type Props = {
  baseline?: DomainScore[];
  weekly?: DomainScore[];
};

export default function PerformanceIndexCard({
  baseline = [],
  weekly = [],
}: Props) {
  // ❌ No weekly data yet
  if (!weekly.length) {
    return (
      <Card className="p-6 text-center text-gray-400">
        Performance index will be available after your first weekly check-in.
      </Card>
    );
  }

  // -------------------------------
  // 🔹 CALCULATIONS (UNCHANGED CORE)
  // -------------------------------
  const avg = (arr: DomainScore[]) =>
    arr.reduce((sum, item) => sum + item.score, 0) / arr.length;

  const baselineAvg = baseline.length ? avg(baseline) : 0;
  const weeklyAvg = avg(weekly);

  const delta = weeklyAvg - baselineAvg;

  const formattedScore = Math.round(weeklyAvg);
  const formattedDelta = delta.toFixed(1);

  const isPositive = delta >= 0;

  // -------------------------------
  // 🔹 TREND INTERPRETATION (NEW)
  // -------------------------------
  let trendLabel = "Stable";
  let trendIcon = "→";
  let trendColor = "text-gray-400";

  if (delta > 2) {
    trendLabel = "Improving";
    trendIcon = "↑";
    trendColor = "text-green-400";
  } else if (delta < -2) {
    trendLabel = "Declining";
    trendIcon = "↓";
    trendColor = "text-red-400";
  }

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <Card className="p-6 flex flex-col gap-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      {/* Title */}
      <div className="text-xs uppercase tracking-wider text-gray-500">
        Performance Index
      </div>

      {/* Main Value */}
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-3">
          <h2 className="text-4xl font-semibold text-white tracking-tight">
            {formattedScore}
          </h2>

          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formattedDelta}
          </span>
        </div>

        {/* Trend */}
        <div className={`text-sm font-medium ${trendColor}`}>
          {trendIcon} {trendLabel}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed">
        Based on your latest weekly performance across all domains
      </p>

      {/* Baseline reference */}
      {baseline.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs text-gray-500">
          <span>Baseline</span>
          <span className="text-gray-300 font-medium">
            {Math.round(baselineAvg)}
          </span>
        </div>
      )}
    </Card>
  );
}