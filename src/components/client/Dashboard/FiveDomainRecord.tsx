import Card from "../../ui/Card";
import { useNavigate } from "react-router-dom";

type DomainScore = {
  domain: string;
  score: number;
};

type AnalysisDomain = {
  domain: string;
  baseline: number;
  current: number;
  delta: number;
  zScore: number;
  drift: "normal" | "warning" | "high";
  status: "improving" | "declining";
};

type Props = {
  baseline?: DomainScore[];
  weekly?: DomainScore[];
  analysisDomains?: AnalysisDomain[]; // ✅ NEW
};

// -------------------------------
// 🔹 zScore → readable
// -------------------------------
const getDriftLabel = (z: number) => {
  const abs = Math.abs(z);
  if (abs < 0.5) return "Stable";
  if (abs < 1) return "Slight shift";
  if (abs < 2) return "Moderate drift";
  return "Critical drift";
};

const getTrend = (delta: number | null) => {
  if (delta === null) return "neutral";
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
};

export default function FiveDomainRecord({
  baseline = [],
  weekly = [],
  analysisDomains = [],
}: Props) {
  const navigate = useNavigate();

  // -------------------------------
  // 🔹 PRIORITY MODE (REAL INTELLIGENCE)
  // -------------------------------
  if (analysisDomains.length > 0) {
    const weakest = analysisDomains.reduce((min, item) =>
      item.zScore < min.zScore ? item : min,
    );

    return (
      <Card className="p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/2">
        {/* Title */}
        <h6 className="text-sm text-gray-400 mb-6">
          Domain Performance Record
        </h6>

        <div className="grid grid-cols-5 px-4 py-4 text-sm text-gray-300 bg-primary mb-3">
          <div>Domain</div>
          <div className="text-center">Baseline</div>
          <div className="text-center">Current</div>
          <div className="text-center">Delta</div>
          <div className="text-right">Status</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {analysisDomains.map((d, index) => {
            const isWeakest = d.domain === weakest.domain;

            return (
              <div
                key={index}
                onClick={() => navigate(`/domain/${d.domain}`)}
                className={`
    grid grid-cols-5 items-center px-4 py-4 rounded-lg cursor-pointer
    transition-all duration-200
    border-t border-gray-800 border-dashed
    hover:bg-white/3 hover:border-white/10
    ${isWeakest ? "bg-rose-400/5 border-rose-400/10" : ""}
  `}
              >
                {/* Domain */}
                <div>
                  <div className="text-white capitalize flex items-center gap-2">
                    {d.domain}
                    {isWeakest && (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-300">
                        at risk
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {getDriftLabel(d.zScore)}
                  </div>
                </div>

                {/* Baseline */}
                <div className="text-center text-gray-400">
                  {d.baseline.toFixed(1)}
                </div>

                {/* Current */}
                <div className="text-center text-white font-medium">
                  {d.current.toFixed(1)}
                </div>

                {/* Delta + Icon */}
                <div className="flex items-center justify-center gap-1">
                  {d.delta > 0 && <span className="text-emerald-400">↑</span>}
                  {d.delta < 0 && <span className="text-rose-400">↓</span>}
                  {d.delta === 0 && <span className="text-gray-400">→</span>}

                  <span
                    className={
                      d.delta > 0
                        ? "text-emerald-400"
                        : d.delta < 0
                          ? "text-rose-400"
                          : "text-gray-400"
                    }
                  >
                    {d.delta > 0
                      ? `+${d.delta.toFixed(1)}`
                      : d.delta.toFixed(1)}
                  </span>
                </div>

                {/* Status */}
                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${
                      d.status === "improving"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // -------------------------------
  // 🔹 FALLBACK MODE (OLD SYSTEM)
  // -------------------------------
  if (!baseline.length) {
    return (
      <Card>
        <div className="text-gray-400 text-center py-10">
          Domain performance will appear after your first assessment.
        </div>
      </Card>
    );
  }

  const hasWeekly = weekly.length > 0;

  const data = baseline.map((baseItem) => {
    const weeklyItem = weekly.find((w) => w.domain === baseItem.domain);

    const current = weeklyItem ? weeklyItem.score : null;
    const delta = current !== null ? current - baseItem.score : null;

    return {
      domain: baseItem.domain,
      baseline: Math.round(baseItem.score),
      current: current !== null ? Math.round(current) : null,
      delta: delta !== null ? Math.round(delta) : null,
    };
  });

  const weakestDomain = data.reduce(
    (min, item) => {
      if (!min) return item;
      return item.current !== null && item.current < (min.current ?? Infinity)
        ? item
        : min;
    },
    null as (typeof data)[0] | null,
  )?.domain;

  return (
    <Card>
      <h6 className="font-semibold text-lg mb-6">
        Five-Domain Performance Record
      </h6>

      <div className="grid grid-cols-4 text-sm text-gray-400 bg-primary rounded-md px-4 py-3 mb-4">
        <div>Domain</div>
        <div className="text-center">Baseline</div>
        <div className="text-center">Current</div>
        <div className="text-center">Delta</div>
      </div>

      <div className="flex flex-col gap-1">
        {data.map((item, index) => {
          const trend = getTrend(item.delta);
          const isWeakest = item.domain === weakestDomain;

          return (
            <div
              key={index}
              onClick={() => navigate(`/domain/${item.domain}`)}
              className={`grid grid-cols-4 items-center text-sm pb-4 pt-4 cursor-pointer transition 
              border-b border-dashed border-[#30363F] last:border-none
              hover:bg-[#1a2330] px-2 rounded-md
              ${isWeakest ? "bg-red-500/5 border-red-500/20" : ""}`}
            >
              <div className="text-gray-300 capitalize flex items-center gap-2">
                {item.domain}

                {isWeakest && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                    weakest
                  </span>
                )}
              </div>

              <div className="text-center text-gray-400">{item.baseline}</div>

              <div className="text-center text-white font-medium">
                {item.current !== null ? item.current : "—"}
              </div>

              <div className="text-center font-medium flex items-center justify-center gap-1">
                {trend === "up" && <span className="text-green-400">↑</span>}
                {trend === "down" && <span className="text-red-400">↓</span>}
                {trend === "flat" && <span className="text-gray-400">→</span>}

                <span
                  className={
                    item.delta === null
                      ? "text-gray-500"
                      : item.delta > 0
                        ? "text-green-400"
                        : item.delta < 0
                          ? "text-red-400"
                          : "text-gray-400"
                  }
                >
                  {item.delta === null
                    ? "—"
                    : item.delta > 0
                      ? `+${item.delta}`
                      : item.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!hasWeekly && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Weekly performance will appear after your first check-in.
        </p>
      )}
    </Card>
  );
}
