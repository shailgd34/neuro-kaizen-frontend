import Card from "../../ui/Card";
import { generateInsights } from "../../../features/baseline/utils/generateInsights";

type DomainItem = {
  key: string;
  label: string;
  drift: {
    status: string;
  };
  domainStatus?: string;
  trend?: string;
};

type Props = {
  domains: DomainItem[];
  mode: "active" | "analysis";
};

const DriftAnalysisCard = ({ domains, mode }: Props) => {
  if (mode !== "analysis") return null;

  const total = domains.length;
  const counts = domains.reduce((acc: any, d) => {
    const key = d.drift.status || "Stable";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const getPercent = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const insights = generateInsights(domains);

  const formatLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("stabilisation")) return "Critical";
    if (l.includes("drift")) return "Declining";
    if (l.includes("expansion") || l.includes("peak")) return "Improving";
    return label.replace(/_/g, " ");
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h6 className="text-white font-bold text-lg mb-1">Performance Details</h6>
        <p className="text-xs text-gray-500 font-medium tracking-tight">Status distribution & observations</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left */}
        <div>
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-4 opacity-50">Distribution</p>
          <div className="space-y-3">
            {Object.entries(counts).map(([key, value]: any) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-400">{formatLabel(key)}</span>
                  <span className={`${
                    key.toLowerCase().includes("stabilisation") ? "text-rose-400" : 
                    key.toLowerCase().includes("drift") ? "text-amber-400" : 
                    key.toLowerCase().includes("expansion") ? "text-emerald-400" : 
                    "text-gray-400"
                  }`}>
                    {getPercent(value)}%
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      key.toLowerCase().includes("stabilisation") ? "bg-rose-400" : 
                      key.toLowerCase().includes("drift") ? "bg-amber-400" : 
                      key.toLowerCase().includes("expansion") ? "bg-emerald-400" : 
                      "bg-gray-500"
                    }`}
                    style={{ width: `${getPercent(value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-4 opacity-50">Key Insights</p>
          <ul className="text-sm text-gray-300 space-y-3">
            {insights.length > 0 ? (
              insights.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-secondary opacity-50">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">No significant patterns detected</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default DriftAnalysisCard;