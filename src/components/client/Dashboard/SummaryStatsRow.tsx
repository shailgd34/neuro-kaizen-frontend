import SummaryStatCard from "./SummaryStatCard";
import { useNavigate } from "react-router-dom";

type Summary = {
  overallStatus?: string;
  primaryIssue?: {
    key: string;
    insights: string[];
    recommendation: string;
  };
  pattern?: string;
};

type Props = {
  summary?: Summary;
};

export default function SummaryStatsRow({ summary }: Props) {
  const navigate = useNavigate();

  // -------------------------------
  // 🔹 EMPTY STATE
  // -------------------------------
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryStatCard
          title="Daily Status"
          value="Pending"
          subtitle="Awaiting calibration"
          icon="activity"
        />
        <SummaryStatCard
          title="Recovery"
          value="Analyzing"
          subtitle="Processing data..."
          icon="brain"
          onClick={() => navigate("/domain/recovery")}
        />
        <SummaryStatCard
          title="Trend"
          value="..."
          subtitle="Calculating trend"
          icon="target"
        />
      </div>
    );
  }

  // -------------------------------
  // 🔹 DATA NORMALIZATION
  // -------------------------------
  const statusKey = summary.overallStatus?.toLowerCase() || "stable";
  
  const drift = {
    label: summary.overallStatus || "Stable",
    subtitle: "System health check",
    color: statusKey === "critical" ? "text-rose-400" : statusKey === "at_risk" ? "text-amber-400" : "text-emerald-400"
  };

  const pattern = summary.pattern?.toLowerCase() || "";
  
  let trend = "Stable";
  let trendColor = "text-white";
  let trendSubtitle = "Baseline check";

  if (pattern.includes("declining") || pattern.includes("degradation")) {
    trend = "Declining";
    trendColor = "text-rose-400";
    trendSubtitle = "Drift detected";
  } else if (pattern.includes("improving") || pattern.includes("growth")) {
    trend = "Improving";
    trendColor = "text-emerald-400";
    trendSubtitle = "Positive trend";
  }

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryStatCard
        title="Overall Status"
        value={<span className={drift.color + " font-bold"}>{drift.label}</span>}
        subtitle={drift.subtitle}
        icon="activity"
      />

      <SummaryStatCard
        title="Recovery"
        value={<span className="text-white font-bold">Stable</span>}
        subtitle={summary.pattern || "Recovery is within normal range"}
        icon="brain"
        onClick={() => navigate("/domain/recovery")}
      />

      <SummaryStatCard
        title="Trend"
        value={<span className={trendColor + " font-bold"}>{trend}</span>}
        subtitle={trendSubtitle}
        icon="target"
      />
    </div>
  );
}