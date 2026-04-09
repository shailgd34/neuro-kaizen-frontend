import { useState } from "react";
import { getSeverityStyle } from "../../../features/baseline/utils/severity";
import Card from "../../ui/Card";

type DriftItem = {
  domain: string;
  zScore: number;
  drift: string;
};

type Props = {
  drift: DriftItem[];
  mode: "analysis";
  onSelect?: (domain: string) => void;
};

const formatZScore = (z: number) => {
  const clamped = Math.max(-2.5, Math.min(2.5, z));
  return Math.round(((clamped + 2.5) / 5) * 100);
};

const DriftCard = ({ drift, onSelect }: Props) => {
  const [active, setActive] = useState<string | null>(null);

  const formatDriftLabel = (drift: string) => {
    const d = drift.toLowerCase();
    if (d.includes("stabilisation")) return "Needs Attention";
    if (d.includes("drift")) return "Declining";
    if (d.includes("expansion")) return "Improving";
    return drift;
  };

  return (
    <Card className="min-h-66.5 flex flex-col p-0 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h6 className="text-white font-bold text-lg mb-0.5">Monitoring</h6>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {drift.map((d, i) => {
          const style = getSeverityStyle(d.drift);
          const score = formatZScore(d.zScore);
          const isActive = active === d.domain;

          return (
            <div
              key={i}
              onClick={() => {
                setActive(d.domain);
                onSelect?.(d.domain);
              }}
              className={`
                relative p-4 rounded-xl cursor-pointer border transition-all duration-300
                ${isActive ? "bg-white/5 border-secondary/30" : "bg-white/[0.02] border-white/5 hover:bg-white/5"}
              `}
            >
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-white font-semibold capitalize tracking-tight">
                  {d.domain}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-medium">
                    {score}% Stability
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/5 ${style.bg} ${style.text}`}>
                    {formatDriftLabel(d.drift)}
                  </span>
                </div>
              </div>

              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${style.text.replace("text", "bg")}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DriftCard;