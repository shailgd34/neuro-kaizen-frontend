import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../../ui/Card";

type DomainScore = {
  domain: string;
  score: number;
};

type Props = {
  baseline?: DomainScore[];
  weekly?: DomainScore[];
};

// ✅ Domain label mapping (important)
const DOMAIN_LABELS: Record<string, string> = {
  cognitive: "Cognitive",
  recovery: "Recovery",
  friction: "Friction",
};

export default function DomainRadarChart({
  baseline = [],
  weekly = [],
}: Props) {
  const hasBaseline = baseline.length > 0;
  const hasWeekly = weekly.length > 0;

  const data = baseline.map((baseItem) => {
    const weeklyItem = weekly.find((w) => w.domain === baseItem.domain);

    return {
      domain:
        DOMAIN_LABELS[baseItem.domain] ||
        baseItem.domain.charAt(0).toUpperCase() +
          baseItem.domain.slice(1),

      baseline: Number(baseItem.score.toFixed(0)),
      weekly: weeklyItem
        ? Number(weeklyItem.score.toFixed(0))
        : null,
    };
  });

  if (!hasBaseline) {
    return (
      <Card className="p-6 text-center text-gray-400">
        No domain data available yet.
      </Card>
    );
  }

  return (
    <Card className="p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      {/* Title */}
      <h6 className="text-sm text-gray-400 mb-6">
        Domain Performance
      </h6>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <RadarChart data={data}>
            {/* Grid */}
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              radialLines={false}
            />

            {/* Labels */}
            <PolarAngleAxis
              dataKey="domain"
              stroke="#9CA3AF"
              tick={{ fontSize: 11 }}
            />

            {/* Radius */}
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.08)"
              tick={{ fontSize: 10 }}
            />

            {/* 🟡 Baseline (secondary, faded) */}
            <Radar
              name="Baseline"
              dataKey="baseline"
              stroke="#6B7280"
              fill="#6B7280"
              fillOpacity={0.05}
              strokeWidth={1}
            />

            {/* 🟢 Current (PRIMARY SIGNAL) */}
            {hasWeekly && (
              <Radar
                name="Current"
                dataKey="weekly"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
            )}

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#E5E7EB",
              }}
              labelStyle={{ color: "#9CA3AF" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          Baseline
        </div>

        {hasWeekly && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Current
          </div>
        )}
      </div>
    </Card>
  );
}