import Card from "../../ui/Card";

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
  summary?: Summary; // ✅ NEW (important)
};

export default function PerformancePressureCard({
  baseline = [],
  weekly = [],
  summary,
}: Props) {
  // -------------------------------
  // 🔹 PRIORITY: USE REAL ANALYSIS (if available)
  // -------------------------------
  if (summary?.primaryIssue) {
    const issueMap: Record<string, string> = {
      cognitive_decline: "Cognitive Decline",
      recovery_breakdown: "Recovery Breakdown",
      friction_overload: "Execution Friction",
    };

    const statusMap: Record<string, { label: string; color: string }> = {
      stable: { label: "Stable", color: "text-green-400" },
      at_risk: { label: "Attention Required", color: "text-yellow-400" },
      critical: { label: "Critical", color: "text-red-400" },
    };

    const issueLabel =
      issueMap[summary.primaryIssue] || summary.primaryIssue;

    const status =
      statusMap[summary.overallStatus || "stable"] ||
      statusMap["stable"];

    return (
      <Card className="p-6 flex flex-col gap-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
        {/* Title */}
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Performance Pressure
        </div>

        {/* Content */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-white font-medium">
              {issueLabel}
            </div>

            <div className="text-sm text-gray-400 mt-1 leading-relaxed">
              {summary.pattern || "Behavioral pattern detected"}
            </div>
          </div>

          <div className={`text-sm text-right font-medium flex-1 ${status.color}`}>
            {status.label}
          </div>
        </div>
      </Card>
    );
  }

  // -------------------------------
  // 🔹 FALLBACK (OLD LOGIC)
  // -------------------------------
  if (!baseline.length || !weekly.length) {
    return (
      <Card className="p-6 text-gray-400 text-sm">
        Performance pressure insights will appear after your weekly check-ins.
      </Card>
    );
  }

  const data = baseline.map((baseItem) => {
    const weeklyItem = weekly.find(
      (w) => w.domain === baseItem.domain
    );

    const current = weeklyItem ? weeklyItem.score : baseItem.score;
    const delta = current - baseItem.score;

    return {
      domain: baseItem.domain,
      delta,
    };
  });

  const worst = data.reduce((min, item) =>
    item.delta < min.delta ? item : min
  );

  const isNegative = worst.delta < 0;

  let status = "Stable";
  let statusColor = "text-green-400";

  if (worst.delta < -5) {
    status = "Attention Required";
    statusColor = "text-red-400";
  } else if (worst.delta < 0) {
    status = "Monitor";
    statusColor = "text-yellow-400";
  }

  return (
    <Card className="p-6 flex flex-col gap-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      {/* Title */}
      <div className="text-xs uppercase tracking-wider text-gray-500">
        Performance Pressure
      </div>

      {/* Content */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-white font-medium capitalize">
            {isNegative ? worst.domain : "All Domains"}
          </div>

          <div className="text-sm text-gray-400">
            {isNegative
              ? `${worst.delta.toFixed(1)}% from baseline`
              : "No negative drift detected"}
          </div>
        </div>

        <div className={`text-sm text-right font-medium flex-2 ${statusColor}`}>
          {status}
        </div>
      </div>
    </Card>
  );
}