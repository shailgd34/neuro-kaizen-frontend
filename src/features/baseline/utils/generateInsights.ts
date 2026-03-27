type Domain = {
  key: string;
  label: string;
  status: string;
  drift: {
    status: string;
  };
};

export const generateInsights = (domains: Domain[]) => {
  const insights: string[] = [];

  const declining = domains.filter(d => d.status === "declining");
  const improving = domains.filter(d => d.status === "improving");

  const cognitive = domains.find(d => d.key === "cognitive");
  const recovery = domains.find(d => d.key === "recovery");
  const friction = domains.find(d => d.key === "friction");

  // 1. Burnout pattern
  if (
    cognitive?.status === "declining" &&
    recovery?.status === "declining"
  ) {
    insights.push(
      "Cognitive capacity and recovery are both declining — possible overload or burnout risk."
    );
  }

  // 2. Effort vs output mismatch
  if (
    friction?.status === "improving" &&
    declining.length >= 1
  ) {
    insights.push(
      "Effort is increasing (friction improving) but performance is dropping — output mismatch detected."
    );
  }

  // 3. Instability
  if (declining.length >= 2 && improving.length >= 1) {
    insights.push(
      "Mixed domain signals indicate instability rather than consistent progress."
    );
  }

  // 4. Fallback
  if (insights.length === 0) {
    insights.push("No major performance risks detected.");
  }

  return insights;
};