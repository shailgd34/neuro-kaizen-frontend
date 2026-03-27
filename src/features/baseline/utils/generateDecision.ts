type Domain = {
  key: string;
  label: string;
  status: string;
  drift: {
    status: string;
  };
};

export const generateDecision = (domains: Domain[]) => {
  const declining = domains.filter(d => d.status === "declining");

  const cognitive = domains.find(d => d.key === "cognitive");
  const recovery = domains.find(d => d.key === "recovery");
  const friction = domains.find(d => d.key === "friction");

  let primaryIssue = "Stable Performance";
  let secondaryIssue = "";
  let action = "Maintain current routine.";

  // ----------- Case 1: Burnout pattern -----------
  if (
    cognitive?.status === "declining" &&
    recovery?.status === "declining"
  ) {
    primaryIssue = "Cognitive Decline";
    secondaryIssue = "Recovery Breakdown";

    action =
      "Reduce workload and prioritise recovery. Focus on sleep, mental breaks, and lowering cognitive strain.";
  }

  // ----------- Case 2: Effort mismatch -----------
  else if (
    friction?.status === "improving" &&
    declining.length > 0
  ) {
    primaryIssue = "Effort-Output Mismatch";
    secondaryIssue = declining.map(d => d.label).join(", ");

    action =
      "Re-evaluate strategy. Increased effort is not translating into results—focus on effectiveness, not intensity.";
  }

  // ----------- Case 3: General decline -----------
  else if (declining.length >= 2) {
    primaryIssue = "Performance Degradation";
    secondaryIssue = declining.map(d => d.label).join(", ");

    action =
      "Stabilise key domains before pushing growth. Address weakest areas first.";
  }

  return {
    primaryIssue,
    secondaryIssue,
    action,
  };
};