import type { ReactNode } from "react";
import Card from "../../ui/Card";

interface Props {
  title: string;
  value: ReactNode;   // ✅ FIX
  subtitle: ReactNode;
}

export default function SummaryStatCard({ title, value, subtitle }: Props) {
  return (
    <Card>

      <div className="text-sm text-gray-400 mb-2">
        {title}
      </div>

      <div className="text-xl font-semibold text-green-400">
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">
          {subtitle}
        </div>
      )}

    </Card>
  );
}