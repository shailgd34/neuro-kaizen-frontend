import Card from "../../ui/Card";

type Props = {
  data: {
    value: number;
    baseline?: number;
    driftStatus?: string;
    weakestDomain?: string;
  };
  mode: "analysis";
};

const getStatusConfig = (status?: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("stabilisation") || s.includes("required") || s.includes("critical")) {
    return {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      label: "Needs Attention",
      message: "Performance is below baseline",
    };
  }
  if (s.includes("drift") || s.includes("declining") || s.includes("risk")) {
    return {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      label: "Declining",
      message: "Minor performance decline",
    };
  }
  if (s.includes("expansion") || s.includes("improving") || s.includes("peak")) {
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      label: "Improving",
      message: "Performance is trending up",
    };
  }
  return {
    color: "text-gray-400",
    bg: "bg-white/5",
    label: "Stable",
    message: "Performance is stable",
  };
};

const KpiCard = ({ data }: Props) => {
  const { value, baseline, driftStatus, weakestDomain } = data;
  const delta = baseline !== undefined ? Math.round(value - baseline) : null;
  const status = getStatusConfig(driftStatus);

  return (
    <Card className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 font-medium">Performance Score</p>
        {driftStatus && (
          <span className={`text-[10px] px-2 py-0.5 rounded-lg border border-white/5 font-semibold ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-4xl font-bold text-white tracking-tight">
          {Math.round(value)}
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 font-medium">Current Index</p>
      </div>

      <div className="flex flex-col gap-1">
        {driftStatus && (
          <p className="text-xs text-gray-400 font-medium">
            {status.message}
          </p>
        )}
        {weakestDomain && (
          <div className="text-[11px] text-gray-500 font-medium">
            Area of focus: <span className="text-secondary font-semibold capitalize">{weakestDomain}</span>
          </div>
        )}
      </div>

      {baseline !== undefined && (
        <div className="flex gap-8 pt-4 border-t border-white/5">
          <div>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Baseline</p>
            <p className="mt-0.5 text-white font-semibold">{Math.round(baseline)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Change</p>
            <p className={`mt-0.5 font-bold ${delta && delta < 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {delta !== null && (
                <>
                  {delta > 0 ? "+" : ""}
                  {delta}%
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default KpiCard;