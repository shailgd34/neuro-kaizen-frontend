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
      <Card className="flex items-center justify-center h-full min-h-[300px] text-gray-500 italic text-sm">
        Data will appear after your first weekly check-in.
      </Card>
    );
  }

  // -------------------------------
  // 🔹 DATA PREP
  // -------------------------------
  const data = weeklySubmissions.map((item) => ({
    week: `Week ${item.week}`,
    score: Math.round(item.nkpi || 0),
  }));

  // -------------------------------
  // 🔹 TREND DETECTION
  // -------------------------------
  let trend = "Stable";
  let trendColor = "text-gray-400";
  let trendBg = "bg-white/5";

  if (data.length >= 2) {
    const last = data[data.length - 1].score;
    const prev = data[data.length - 2].score;

    if (last > prev) {
      trend = "Improving";
      trendColor = "text-emerald-400";
      trendBg = "bg-emerald-500/10";
    } else if (last < prev) {
      trend = "Declining";
      trendColor = "text-rose-400";
      trendBg = "bg-rose-500/10";
    }
  }

  return (
    <Card title="Performance Trends" className="relative group h-full flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-6 right-6 z-20">
        <div className={`px-2.5 py-1 rounded-lg border border-white/5 ${trendBg} ${trendColor} text-[10px] font-bold tracking-tight`}>
           {trend}
        </div>
      </div>

      <div className="w-full flex-1 min-h-[280px] -ml-6 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            {/* Gradient */}
            <defs>
              <linearGradient id="lineGoldGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8F5E25" />
                <stop offset="100%" stopColor="#EDDC90" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              stroke="rgba(255,255,255,0.03)"
              strokeDasharray="4 4"
              vertical={false}
            />

            {/* X */}
            <XAxis
              dataKey="week"
              stroke="#4B5563"
              tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            {/* Y */}
            <YAxis
              stroke="#4B5563"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickCount={6}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                background: "#11161D",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontSize: "11px",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                padding: "10px"
              }}
              labelStyle={{ color: "#6B7280", marginBottom: "4px", fontWeight: 600 }}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            />

            {/* Main Line */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGoldGradient)"
              strokeWidth={3}
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: "#11161D",
                stroke: "#EDDC90",
              }}
              activeDot={{
                r: 6,
                stroke: "#EDDC90",
                strokeWidth: 3,
                fill: "#11161D",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4">
        {[
          { label: "Target range", color: "bg-secondary" },
          { label: "Average", color: "bg-gray-500/50" },
        ].map((legend, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${legend.color}`} />
            <span className="text-[11px] text-gray-500 font-medium">{legend.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}