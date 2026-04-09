export const getSeverityStyle = (type: string) => {
  switch (type) {
    case "Stabilisation Required":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
      };

    case "Systemic Drift":
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
      };

    case "Light Strain":
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
      };

    case "Expansion":
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
      };

    case "Peak Activation":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
      };

    case "Stable":
    default:
      return {
        text: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
      };
  }
};