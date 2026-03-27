import Card from "../../ui/Card";

type Props = {
  insights: string[];
  mode: "analysis";
};

const Insights = ({ insights }: Props) => {
  const hasInsights = insights && insights.length > 0;

  return (
    <Card className="p-5 text-sm text-gray-200">
      {/* Title */}
      <h6 className="text-sm text-gray-400 mb-3">
        Current Focus
      </h6>

      {/* Content */}
      {hasInsights ? (
        <div className="space-y-2">
          {insights.map((item, index) => (
  <p
    key={index}
    className={`leading-relaxed ${
      index === 0 ? "text-red-400 font-medium" : "text-gray-300"
    }`}
  >
    {item}
  </p>
))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          No significant insights detected at this time.
        </p>
      )}
    </Card>
  );
};

export default Insights;