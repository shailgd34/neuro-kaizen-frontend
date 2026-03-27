import Card from "../../ui/Card";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: "green" | "yellow" | "red" | "blue";
}

const colorMap = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  blue: "text-blue-400",
};

export default function StatCard({
  title,
  value,
  subtitle,
  color = "blue",
}: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-gray-400">{title}</span>

      <h4 className={`text-3xl font-semibold ${colorMap[color]}`}>
        {value}
      </h4>

      {subtitle && (
        <span className="text-sm text-gray-500">{subtitle}</span>
      )}
    </Card>
  );
}