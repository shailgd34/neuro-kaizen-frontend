type Domain = {
  key: string;
  label: string;
  domainStatus: string;
  drift: {
    status: string;
  };
  trend?: string;
};

export const generateDecision = (domains: Domain[]) => {
  const declining = domains.filter(
    (d) =>
      d.trend === "persistent_decline" ||
      d.drift.status === "Systemic Drift" ||
      d.drift.status === "Stabilisation Required",
  );

  const cognitive = domains.find((d) => d.key === "cognitive");
  const recovery = domains.find((d) => d.key === "recovery");
  const friction = domains.find((d) => d.key === "friction");

  let primaryIssue = "Stable Performance";
  let secondaryIssue = "";
  let action = "Maintain current routine.";

  // ----------- Case 1: Burnout pattern -----------
  if (
    cognitive?.domainStatus === "Critical" &&
    recovery?.domainStatus === "Critical"
  ) {
    primaryIssue = "Cognitive Decline";
    secondaryIssue = "Recovery Breakdown";

    action =
      "Reduce workload and prioritise recovery. Focus on sleep and lowering cognitive strain.";
  }

  // ----------- Case 2: Effort mismatch -----------
  else if (friction?.drift.status === "Expansion" && declining.length > 0) {
    primaryIssue = "Effort-Output Mismatch";
    secondaryIssue = declining.map((d) => d.label).join(", ");

    action =
      "Environment is improving but performance is not. Focus on internal capacity, not effort.";
  }

  // ----------- Case 3: General decline -----------
  else if (declining.length >= 2) {
    primaryIssue = "Performance Degradation";
    secondaryIssue = declining.map((d) => d.label).join(", ");

    action = "Stabilise weakest domains before pushing growth.";
  }

  return {
    primaryIssue,
    secondaryIssue,
    action,
  };
};
