export const getSeverityStyle = (type: string) => {
  switch (type) {
    case "critical":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
      };

    case "warning":
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
      };

    case "high":
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
      };

    default:
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
      };
  }
};