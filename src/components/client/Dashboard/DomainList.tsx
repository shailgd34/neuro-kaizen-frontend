import Card from "../../ui/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDriftConfig } from "./../../../features/baseline/utils/getDriftConfig";
import { DOMAINS } from "./../../../constants/domain";
import { getSeverityStyle } from "../../../features/baseline/utils/severity";

type DomainItem = {
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
  trend?: string;
};

type Props = {
  domains: DomainItem[];
  mode: "active";
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

export default function DomainList({ domains }: Props) {
  const navigate = useNavigate();

  const getNormalizedScore = (d: DomainItem) => {
    return d.direction === "lower_better" ? 100 - d.score : d.score;
  };

  const worstDomain = domains.length > 0 
    ? domains.reduce((worst, current) => 
        getNormalizedScore(current) < getNormalizedScore(worst) ? current : worst
      , domains[0])
    : null;

  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {domains.map((d) => {
          const domainKey = normalizeDomainKey(d.key);
          const domainConfig = DOMAINS.find((x) => x.key === domainKey);
          const accentColor = domainConfig?.color || "#EDDC90";

          const normalized = getNormalizedScore(d);
          const isWorst = worstDomain && d.key === worstDomain.key;
          const severityStyle = getSeverityStyle(d.drift.status);
          const drift = getDriftConfig(d.drift.status);

          const driftLabel = drift.label.toLowerCase().includes("stabilisation") ? "Critical" : 
                            drift.label.toLowerCase().includes("drift") ? "Declining" :
                            drift.label.toLowerCase().includes("expansion") ? "Improving" : "Stable";

          return (
            <div
              key={d.key}
              onClick={() => navigate(`/domain/${domainKey}`)}
              className={`
                relative group p-5 rounded-2xl cursor-pointer
                bg-white/[0.02] border border-white/5
                transition-all duration-300 ease-out
                hover:bg-white/[0.05] hover:border-white/10
                ${isWorst ? "border-rose-500/30" : ""}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{d.label}</p>
                {d.drift.status !== "inactive" && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/5 ${severityStyle.text} bg-white/5`}>
                    {driftLabel}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl font-bold text-white tracking-tight">
                  {animatedScores[d.key] ?? 0}
                </p>
                {isWorst && (
                  <span className="text-[10px] text-rose-400 font-medium">Focus</span>
                )}
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${normalized}%`,
                    background: accentColor,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium uppercase tracking-tight">
                <span className="opacity-50">{d.volatility.level} volatility</span>
                {d.trend === "persistent_decline" ? (
                  <span className="text-rose-400 font-bold">↓</span>
                ) : (
                  <span className="text-emerald-400 font-bold">↑</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {worstDomain && (
        <Card className="p-6 bg-rose-500/5 border-rose-500/20">
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-2">Priority Insight</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="text-white font-semibold">{worstDomain.label}</span> is showing signs of performance drift. We recommend focusing on recovery strategies in this area to maintain stability.
          </p>
        </Card>
      )}
    </div>
  );
}
