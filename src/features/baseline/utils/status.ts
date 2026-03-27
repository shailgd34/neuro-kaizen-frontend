export const getDraftStatusConfig = (status?: string) => {
  const map = {
    pending: {
      label: "Pending",
      color: "text-yellow-400",
    },
    draft: {
      label: "In Progress",
      color: "text-blue-400",
    },
    completed: {
      label: "Completed",
      color: "text-green-400",
    },
  };

  return map[status as keyof typeof map] || {
    label: "Unknown",
    color: "text-gray-400",
  };
};