import { DOMAIN_COLORS } from "../../constants/domains";

export default function DomainBadge({ domain }: { domain: string }) {
  const config = DOMAIN_COLORS[domain];

  if (!config) return null;

  return (
    <span
      className="px-2 py-1 text-xs rounded-full font-medium "
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </span>
  );
}
