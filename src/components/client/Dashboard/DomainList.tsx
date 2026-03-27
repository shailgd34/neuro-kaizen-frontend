import Card from "../../ui/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDriftConfig } from "./../../../features/baseline/utils/getDriftConfig";
import { DOMAINS } from "./../../../constants/domain";
import { getSeverityStyle } from "../../../features/baseline/utils/severity";

type DomainItem = {
  [x: string]: any;
  key: string;
  label: string;
  score: number;
  direction: "higher_better" | "lower_better";
  volatility: {
    level: "low" | "moderate" | "high";
  };
  drift: {
    status: string;
  };
};

type Props = {
  domains: DomainItem[];
  mode: "active"; // only analysis mode
};

const normalizeDomainKey = (key: string) => {
  if (!key) return key;

  if (key.includes("cognitive")) return "cognitive";
  if (key.includes("recovery")) return "recovery";
  if (key.includes("flow")) return "flow";
  if (key.includes("identity")) return "identity";
  if (key.includes("friction")) return "friction";

  return key;
};

const DomainList = ({ domains, mode }: Props) => {
  const navigate = useNavigate();

  // ----------- Normalize Score -----------
  const getNormalizedScore = (d: DomainItem) => {
    return d.direction === "lower_better" ? 100 - d.score : d.score;
  };

  // ----------- Find Worst Domain -----------
  const worstDomain = domains.reduce((worst, current) => {
    return getNormalizedScore(current) < getNormalizedScore(worst)
      ? current
      : worst;
  }, domains[0]);

  // ----------- Animated Scores -----------
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedScores((prev) => {
        const updated: Record<string, number> = {};

        domains.forEach((d) => {
          const current = prev[d.key] ?? 0;

          if (current < d.score) {
            updated[d.key] = Math.min(current + 1, d.score);
          } else {
            updated[d.key] = d.score;
          }
        });

        return updated;
      });
    }, 15);

    return () => clearInterval(interval);
  }, [domains]);

  // ----------- Insight Generator -----------
  const getInsight = (d: DomainItem) => {
    if (d.volatility.level === "high") return "High variability detected";
    if (d.volatility.level === "moderate") return "Fluctuations observed";
    return "Stable performance";
  };

  return (
    <div className="space-y-4">
      {/* ----------- Domain Cards ----------- */}
      <div className="grid grid-cols-5 gap-4">
        {domains.map((d) => {
          const domainKey = normalizeDomainKey(d.key);
          const domainConfig = DOMAINS.find((x) => x.key === domainKey);
          const color = domainConfig?.color || "#6B7280";

          const normalized = getNormalizedScore(d);
          const isWorst = d.key === worstDomain.key;
          const severityStyle = getSeverityStyle(d.drift.status);

          const drift = getDriftConfig(d.drift.status);

          return (
            <div
              key={d.key}
              onClick={() => navigate(`/domain/${domainKey}`)}
              className={`relative group bg-[#111827] p-4 rounded-xl border-l-2 transition-all duration-300 cursor-pointer hover:border-gray-600 ${
                isWorst ? "ring-1 ring-red-400/40" : ""
              } `}
              style={{ borderColor: color }}
            >
              {/* Title */}
              <p className="text-xs text-gray-400">{d.label}</p>

              {mode === "active" && isWorst && (
                <p className="text-[10px] text-red-400 mt-1">Focus Area</p>
              )}

              <p
                className={`text-2xl font-semibold mt-2 ${severityStyle.text}`}
              >
                {animatedScores[d.key] ?? 0}
              </p>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${normalized}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-2 text-[11px] text-gray-400 flex justify-between">
                <span>Volatility: {d.volatility.level}</span>

                <div className="flex gap-2 items-center">
                  {/* Drift */}
                  {d.drift.status !== "inactive" && (
                    <span className={`${drift.color} capitalize`}>
                      {drift.label}
                    </span>
                  )}

                  {/* NEW → Trend */}
                  {d.status && (
                    <span
                      className={`capitalize ${
                        d.status === "declining"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute hidden group-hover:block bottom-full mb-2 left-0 w-56 bg-black text-white text-xs p-2 rounded shadow-lg z-10">
                <p className="font-medium mb-1">
                  {domainConfig?.label || d.label}
                </p>
                <p>Score: {d.score}</p>
                <p>Volatility: {d.volatility.level}</p>
                <p className="mt-1 text-gray-300">{getInsight(d)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------- Primary Risk Insight ----------- */}
      <Card className="bg-[#111827] p-5 rounded-xl">
        <p className="text-sm text-gray-400 mb-2">Primary Risk Insight</p>

        <p className="text-sm text-gray-300">
          {worstDomain.label} is currently the weakest domain with{" "}
          <span className="text-red-400">{worstDomain.score}</span> score. This
          area shows the highest performance risk and may require focused
          intervention.
        </p>
      </Card>
    </div>
  );
};

export default DomainList;
