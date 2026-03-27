import { getSeverityStyle } from "../../../features/baseline/utils/severity";
import Card from "../../ui/Card";

type DriftItem = {
  domain: string;
  zScore: number;
  drift: "normal" | "warning" | "critical" | "high";
};

type Props = {
  drift: DriftItem[];
  mode: "analysis";
};



const getZLabel = (z: number) => {
  if (z <= -2) return "Critical";
  if (z <= -1) return "Declining";
  if (z < 1) return "Stable";
  if (z < 2) return "Elevated";
  return "Peak";
};

const formatZScore = (z: number) => {
  // clamp range
  const clamped = Math.max(-2.5, Math.min(2.5, z));

  // normalize to 0–100
  const normalized = ((clamped + 2.5) / 5) * 100;

  return Math.round(normalized);
};

const DriftCard = ({ drift }: Props) => {
  return (
    <Card className="p-6 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Drift Monitoring</p>

        <span className="text-xs text-red-400">
          ● Active
        </span>
      </div>

      {/* Drift List */}
      <div className="mt-4 space-y-3">
        {drift.map((d, i) => {
  const style = getSeverityStyle(d.drift);

  return (
    <div
      key={i}
      className={`flex justify-between items-center text-sm p-4 rounded ${style.bg}`}
    >
      <span className="text-gray-300 capitalize">
        {d.domain}
      </span>

      <div className="flex items-center gap-3">
  <span className="text-xs text-gray-500">
    {formatZScore(d.zScore)} / 100
  </span>

  <span className="text-xs text-gray-500">
    {getZLabel(d.zScore)}
  </span>

  <span className={`font-medium ${style.text}`}>
    {d.drift.toUpperCase()}
  </span>
</div>
    </div>
  );
})}
      </div>
    </Card>
  );
};

export default DriftCard;