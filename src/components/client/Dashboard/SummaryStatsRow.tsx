import SummaryStatCard from "./SummaryStatCard";

type DomainScore = {
  domain: string;
  score: number;
};

type Summary = {
  overallStatus?: string;
  primaryIssue?: string;
  secondaryIssue?: string;
  pattern?: string;
};

type Props = {
  baseline?: DomainScore[];
  weekly?: DomainScore[];
  summary?: Summary;
};

// -------------------------------
// 🔹 SUBTLE COLOR SYSTEM
// -------------------------------
const subtleState = {
  positive: "text-emerald-300",
  negative: "text-rose-300",
  neutral: "text-gray-400",
};

const getStatusStyle = (status?: string) => {
  switch (status) {
    case "critical":
      return subtleState.negative;
    case "at_risk":
      return subtleState.positive;
    default:
      return subtleState.neutral;
  }
};

export default function SummaryStatsRow({
  baseline = [],
  weekly = [],
  summary,
}: Props) {
  // -------------------------------
  // 🔹 PRIMARY MODE (USE BACKEND INTELLIGENCE)
  // -------------------------------
  if (summary) {
    const statusMap: Record<
      string,
      { label: string; subtitle: string }
    > = {
      stable: {
        label: "Stable",
        subtitle: "Performance within expected range",
      },
      at_risk: {
        label: "At Risk",
        subtitle: "Performance instability detected",
      },
      critical: {
        label: "Critical",
        subtitle: "Immediate attention required",
      },
    };

    const drift =
      statusMap[summary.overallStatus || "stable"] ||
      statusMap["stable"];

    // Recovery interpretation (soft, not aggressive)
    let recovery = "Moderate";
    let recoverySubtitle = summary.pattern || "Recovery behavior stable";

    if (summary.pattern?.includes("recovery")) {
      recovery = "Low";
      recoverySubtitle = summary.pattern;
    }

    // Trend interpretation
    let trend = "Stable";
    let trendSubtitle = "No major change";

    if (summary.pattern?.includes("declining")) {
      trend = "Negative";
      trendSubtitle = "Downward trend detected";
    } else if (summary.pattern?.includes("improving")) {
      trend = "Positive";
      trendSubtitle = "Upward trend detected";
    }

    return (
      <div className="grid grid-cols-3 gap-6">
        <SummaryStatCard
          title="Drift Classification"
          value={
            <span className={getStatusStyle(summary.overallStatus)}>
              {drift.label}
            </span>
          }
          subtitle={drift.subtitle}
        />

        <SummaryStatCard
          title="Recovery State"
          value={
            <span className="text-gray-200 font-medium">
              {recovery}
            </span>
          }
          subtitle={recoverySubtitle}
        />

        <SummaryStatCard
          title="Trend Direction"
          value={
            <span
              className={
                trend === "Positive"
                  ? subtleState.positive
                  : trend === "Negative"
                  ? subtleState.negative
                  : subtleState.neutral
              }
            >
              {trend}
            </span>
          }
          subtitle={trendSubtitle}
        />
      </div>
    );
  }

  // -------------------------------
  // 🔹 FALLBACK MODE (SAFE)
  // -------------------------------
  if (!baseline.length || !weekly.length) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <SummaryStatCard
          title="Drift Classification"
          value="—"
          subtitle="Available after weekly check-ins"
        />
        <SummaryStatCard
          title="Recovery State"
          value="—"
          subtitle="Available after weekly check-ins"
        />
        <SummaryStatCard
          title="Trend Direction"
          value="—"
          subtitle="Available after weekly check-ins"
        />
      </div>
    );
  }

  // -------------------------------
  // 🔹 FALLBACK CALCULATION (OLD LOGIC)
  // -------------------------------
  const data = baseline.map((baseItem) => {
    const weeklyItem = weekly.find(
      (w) => w.domain === baseItem.domain
    );

    const current = weeklyItem ? weeklyItem.score : baseItem.score;
    const delta = current - baseItem.score;

    return { delta };
  });

  const avgDelta =
    data.reduce((sum, d) => sum + d.delta, 0) / data.length;

  let driftLabel = "Stable";
  let driftSubtitle = "Within parameters";

  if (avgDelta > 3) {
    driftLabel = "Optimising";
    driftSubtitle = "Above baseline";
  } else if (avgDelta < -3) {
    driftLabel = "Drifting";
    driftSubtitle = "Below baseline";
  }

  const improvedCount = data.filter((d) => d.delta > 0).length;
  const recoveryRate = Math.round(
    (improvedCount / data.length) * 100
  );

  let trend = "Neutral";
  let trendSubtitle = "No major change";

  if (avgDelta > 1) {
    trend = "Positive";
    trendSubtitle = "Improving trend";
  } else if (avgDelta < -1) {
    trend = "Negative";
    trendSubtitle = "Declining trend";
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <SummaryStatCard
        title="Drift Classification"
        value={
          <span className="text-gray-200 font-medium">
            {driftLabel}
          </span>
        }
        subtitle={driftSubtitle}
      />

      <SummaryStatCard
        title="Recovery State"
        value={
          <span className="text-gray-200 font-medium">
            {recoveryRate}%
          </span>
        }
        subtitle={`${improvedCount} of ${data.length} domains improved`}
      />

      <SummaryStatCard
        title="Trend Direction"
        value={
          <span
            className={
              trend === "Positive"
                ? subtleState.positive
                : trend === "Negative"
                ? subtleState.negative
                : subtleState.neutral
            }
          >
            {trend}
          </span>
        }
        subtitle={trendSubtitle}
      />
    </div>
  );
}