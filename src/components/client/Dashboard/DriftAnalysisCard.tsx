import Card from "../../ui/Card";
import { generateInsights } from "../../../features/baseline/utils/generateInsights";

type DomainItem = {
  key: string;
  label: string;
  drift: {
    status: string;
  };
  status: string;
};

type Props = {
  domains: DomainItem[];
  mode: "active" | "analysis";
};

const DriftAnalysisCard = ({ domains, mode }: Props) => {
  if (mode !== "analysis") return null;

  // ----------- Distribution -----------
  const total = domains.length;

  const counts = domains.reduce((acc: any, d) => {
    acc[d.drift.status] = (acc[d.drift.status] || 0) + 1;
    return acc;
  }, {});

  const getPercent = (count: number) => Math.round((count / total) * 100);

  // ----------- Observations -----------
  const insights = generateInsights(domains);

  return (
    <Card className="">
      <p className="text-sm text-gray-400 mb-4">
        Drift Classification Analysis
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Left */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Current Status Distribution
          </p>

          <div className="space-y-1 text-sm">
            {Object.entries(counts).map(([key, value]: any) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize text-gray-400">{key}</span>
                <span className="text-green-400">{getPercent(value)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Key Observations</p>

          <ul className="text-sm text-gray-300 space-y-1">
            {insights.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default DriftAnalysisCard;
