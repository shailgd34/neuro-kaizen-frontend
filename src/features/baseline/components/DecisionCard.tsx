import Card from './../../../components/ui/Card';

type Props = {
  summary: any;
  mode: string;
};



const DecisionCard = ({ summary, mode }: Props) => {
  if (mode !== "analysis") return null;

  const primary = summary?.primaryIssue;
  const secondary = summary?.secondaryIssue;

  const isCritical = summary?.overallStatus === "Critical";

  return (
    <Card className=" space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Performance Decision</p>

        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            isCritical
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {summary?.overallStatus}
        </span>
      </div>

      {/* PRIMARY */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Primary Issue</p>

        <p className="text-lg font-semibold text-white">
          {primary?.key?.replaceAll("_", " ")}
        </p>
      </div>

      {/* INSIGHTS */}
      <div className="space-y-2">
        {primary?.insights?.map((i: string, idx: number) => (
          <p key={idx} className="text-sm text-gray-300 leading-relaxed">
            • {i}
          </p>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-white/5" />

      {/* SECONDARY */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Secondary Factor</p>

        <p className="text-sm text-gray-300">
          {secondary?.key?.replaceAll("_", " ")}
        </p>
      </div>

      {/* ACTION */}
      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-gray-500 mb-1">Recommended Action</p>

        <p className="text-sm text-white leading-relaxed">
          {primary?.recommendation}
        </p>
      </div>

    </Card>
  );
};

export default DecisionCard;