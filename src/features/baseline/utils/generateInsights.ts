type Domain = {
  key: string;
  label: string;

  domainStatus?: string; // Critical, Stable, Peak
  trend?: string; // persistent_decline, declining

  drift: {
    status: string; // Systemic Drift, etc.
  };
};

export const generateInsights = (domains: Domain[]) => {
  const insights: string[] = [];

  // ----------- Derived groups -----------

  const declining = domains.filter(
    d =>
      d.trend === "persistent_decline" ||
      d.drift.status === "Systemic Drift" ||
      d.drift.status === "Stabilisation Required"
  );

  const improving = domains.filter(
    d =>
      d.drift.status === "Expansion" ||
      d.drift.status === "Peak Activation"
  );

  const cognitive = domains.find(d => d.key === "cognitive");
  const recovery = domains.find(d => d.key === "recovery");
  const friction = domains.find(d => d.key === "friction");

  // ----------- 1. Burnout pattern -----------

  if (
    cognitive?.domainStatus === "Critical" &&
    recovery?.domainStatus === "Critical"
  ) {
    insights.push(
      "Cognitive capacity and recovery are critically low — possible overload or burnout risk."
    );
  }

  // ----------- 2. Effort vs output mismatch -----------

  if (
    (friction?.drift.status === "Expansion" ||
      friction?.drift.status === "Peak Activation") &&
    declining.length >= 1
  ) {
    insights.push(
      "External conditions are improving, but performance is declining — internal capacity issue detected."
    );
  }

  // ----------- 3. Instability -----------

  if (declining.length >= 2 && improving.length >= 1) {
    insights.push(
      "Mixed signals across domains suggest instability rather than consistent progress."
    );
  }

  // ----------- 4. Severe risk -----------

  if (
    domains.some(d => d.drift.status === "Stabilisation Required")
  ) {
    insights.push(
      "Severe performance deviation detected — immediate attention required."
    );
  }

  // ----------- 5. Fallback -----------

  if (insights.length === 0) {
    insights.push("Performance is stable with no major risks detected.");
  }

  return insights;
};