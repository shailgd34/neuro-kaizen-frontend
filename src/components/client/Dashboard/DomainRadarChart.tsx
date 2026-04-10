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
import { useNavigate } from "react-router-dom";

type AnalysisDomain = {
  domain: string;
  baseline: number;
  current: number;
};

type Props = {
  analysisDomains?: AnalysisDomain[];
};

// Simple label mapping
const DOMAIN_LABELS: Record<string, string> = {
  cognitive: "Cognitive",
  recovery: "Recovery",
  friction: "Friction",
};

export default function DomainRadarChart({
  analysisDomains = [],
}: Props) {
  const navigate = useNavigate();

  // -------------------------------
  // 🔹 EMPTY STATE
  // -------------------------------
  if (!analysisDomains.length) {
    return (
      <Card className="flex items-center justify-center min-h-[300px] text-gray-500 italic text-sm">
        Data will appear after your first check-in.
      </Card>
    );
  }

  // -------------------------------
  // 🔹 DATA PREP
  // -------------------------------
  const data = analysisDomains.map((d) => ({
    domain:
      DOMAIN_LABELS[d.domain] ||
      d.domain.charAt(0).toUpperCase() + d.domain.slice(1),

    baseline: Math.round(d.baseline),
    current: Math.round(d.current),
    originalDomain: d.domain, // Keep original for navigation
  }));

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <Card title="Performance Balance" className="relative group">
      <div className="w-full h-[320px]">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            {/* ... PolarGrid, PolarAngleAxis, etc unchanged ... */}
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              radialLines={true}
              strokeDasharray="2 2"
            />
            <PolarAngleAxis
              dataKey="domain"
              stroke="#9CA3AF"
              tick={{ fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.03)"
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Baseline"
              dataKey="baseline"
              stroke="#4B5563"
              fill="#4B5563"
              fillOpacity={0.08}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#EDDC90"
              fill="#EDDC90"
              fillOpacity={0.2}
              strokeWidth={2}
            />
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
              labelStyle={{ color: "#9CA3AF", marginBottom: "4px", fontWeight: 600 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain Quick Links */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/5">
        {analysisDomains.map((d, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/domain/${d.domain}`)}
            className="flex items-center gap-2 group/btn"
          >
            <div className="w-2 h-2 rounded-full bg-secondary group-hover/btn:scale-125 transition-transform" />
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider group-hover/btn:text-white transition-colors">
              {DOMAIN_LABELS[d.domain] || d.domain}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}