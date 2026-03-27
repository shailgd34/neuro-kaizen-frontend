import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card from "../../ui/Card";

type Submission = {
  type: "baseline" | "weekly";
  week: number;
  nkpi?: number;
};

type Props = {
  submissions?: Submission[];
};

export default function PerformanceChart({
  submissions = [],
}: Props) {
  // -------------------------------
  // 🔹 FILTER WEEKLY DATA
  // -------------------------------
  const weeklySubmissions = submissions
    .filter((s) => s.type === "weekly" && s.nkpi !== undefined)
    .sort((a, b) => a.week - b.week);

  if (weeklySubmissions.length < 1) {
    return (
      <Card className="p-6 text-center text-gray-400">
        Performance trend will appear after multiple weekly check-ins.
      </Card>
    );
  }

  // -------------------------------
  // 🔹 REAL DATA (IMPORTANT FIX)
  // -------------------------------
  const data = weeklySubmissions.map((item) => ({
    week: `W${item.week}`,
    score: Math.round(item.nkpi || 0),
  }));

  // -------------------------------
  // 🔹 TREND DETECTION
  // -------------------------------
  let trend = "stable";
  let trendColor = "text-gray-400";

  if (data.length >= 2) {
    const last = data[data.length - 1].score;
    const prev = data[data.length - 2].score;

    if (last > prev) {
      trend = "Improving ↑";
      trendColor = "text-green-400";
    } else if (last < prev) {
      trend = "Declining ↓";
      trendColor = "text-red-400";
    }
  }

  return (
    <Card className="p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h6 className="text-sm text-gray-400">
          Performance Trajectory
        </h6>

        <span className={`text-xs font-medium ${trendColor}`}>
          {trend}
        </span>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            {/* Gradient */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X */}
            <XAxis
              dataKey="week"
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y */}
            <YAxis
              stroke="#6B7280"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

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
              cursor={{ stroke: "#374151", strokeWidth: 1 }}
            />

            {/* Glow */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#34d399"
              strokeWidth={6}
              opacity={0.08}
              dot={false}
            />

            {/* Main */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: "#0F1720",
                stroke: "#34d399",
              }}
              activeDot={{
                r: 6,
                stroke: "#34d399",
                strokeWidth: 2,
                fill: "#0F1720",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}