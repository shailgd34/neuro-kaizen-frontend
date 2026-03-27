type DriftStatus = "stable" | "strain" | "drift" | "critical";

export const getDriftConfig = (status: string) => {
  const map: Record<
    DriftStatus,
    {
      label: string;
      color: string;
      bg: string;
    }
  > = {
    stable: {
      label: "Stable",
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    strain: {
      label: "Strain",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    drift: {
      label: "Drift",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    critical: {
      label: "Critical",
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  };

  return map[status as DriftStatus] || {
    label: status,
    color: "text-gray-400",
    bg: "bg-gray-400/10",
  };
};