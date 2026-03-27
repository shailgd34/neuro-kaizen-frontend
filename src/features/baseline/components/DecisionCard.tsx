
import { generateDecision } from "../utils/generateDecision";
import Card from './../../../components/ui/Card';

type Props = {
  domains: any[];
  mode: string;
};

const DecisionCard = ({ domains, mode }: Props) => {
  if (mode !== "analysis") return null;

  const decision = generateDecision(domains);

  return (
    <Card className="space-y-3">
      <p className="text-sm text-gray-400">Performance Decision</p>

      {/* Primary Issue */}
      <div>
        <p className="text-xs text-gray-500">Primary Issue</p>
        <p className="text-sm text-red-400 font-medium">
          {decision.primaryIssue}
        </p>
      </div>

      {/* Secondary */}
      {decision.secondaryIssue && (
        <div>
          <p className="text-xs text-gray-500">Secondary Factors</p>
          <p className="text-sm text-gray-300">
            {decision.secondaryIssue}
          </p>
        </div>
      )}

      {/* Action */}
      <div>
        <p className="text-xs text-gray-500">Recommended Action</p>
        <p className="text-sm text-gray-300">
          {decision.action}
        </p>
      </div>
    </Card>
  );
};

export default DecisionCard;