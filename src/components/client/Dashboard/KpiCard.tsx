import Card from "../../ui/Card";

type Props = {
  data: {
    value: number;
    baseline?: number;
    driftStatus?: "normal" | "warning" | "critical";
  };
  mode: "analysis";
};

const KpiCard = ({ data }: Props) => {
  const { value, baseline, driftStatus } = data;

  const delta =
    baseline !== undefined ? value - baseline : null;

  const isNegative = delta !== null && delta < 0;

  const deltaColor =
    delta === null
      ? "text-white"
      : isNegative
      ? "text-red-400"
      : "text-green-400";

  // 🟢 Drift color
  const driftColor =
    driftStatus === "critical"
      ? "text-red-400"
      : driftStatus === "warning"
      ? "text-yellow-400"
      : "text-green-400";

  // 🧠 Interpretation (this is key)
  const getInterpretation = () => {
    if (!driftStatus) return "";

    if (driftStatus === "critical")
      return "Performance is significantly below baseline";

    if (driftStatus === "warning")
      return "Performance is showing early signs of decline";

    return "Performance is stable";
  };

  return (
    <Card className="p-6 rounded-xl flex flex-col justify-between min-h-66.5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Net Key Performance Indicator
        </p>

        {/* 🔥 Drift badge */}
        {driftStatus && (
          <span className={`text-xs font-medium ${driftColor}`}>
            ● {driftStatus.toUpperCase()}
          </span>
        )}
      </div>

      {/* Main Score */}
      <div className="mt-3">
        <h3
          className={`text-5xl font-semibold tracking-tight ${deltaColor}`}
        >
          {Math.round(value)}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          Current Score
        </p>
      </div>

      {/* 🧠 Interpretation line */}
      {driftStatus && (
        <p className="text-xs mt-3 text-gray-400">
          {getInterpretation()}
        </p>
      )}

      {/* Comparison */}
      {baseline !== undefined && (
        <div className="flex gap-8 mt-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Baseline</p>
            <p className="mt-1">
              {Math.round(baseline)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Change</p>
            <p
              className={`mt-1 ${
                isNegative
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {delta !== null && (
                <>
                  {delta > 0 ? "+" : ""}
                  {Math.round(delta)}
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