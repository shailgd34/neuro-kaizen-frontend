import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getBaselineResults } from "../../api/baselineApi";
import { DOMAIN_COLORS } from "./../../constants/domains";

export default function WeeklyResult() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["assessment-results"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;

  /* =========================
     GET BASELINE + WEEKLY
  ========================= */

  const baseline = useMemo(() => {
    return apiData?.submissions?.find((s: any) => s.type === "baseline");
  }, [apiData]);

  const weeklySorted = useMemo(() => {
    return apiData?.submissions
      ?.filter((s: any) => s.type === "weekly")
      ?.sort((a: any, b: any) => b.week - a.week);
  }, [apiData]);

  const latestWeekly = weeklySorted?.[0];
  const prevWeekly = weeklySorted?.[1];

  /* =========================
     LOADING
  ========================= */

  if (isLoading || !baseline || !latestWeekly) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading weekly results...
      </div>
    );
  }

  /* =========================
     PREPARE DATA
  ========================= */

  const getScore = (data: any, domain: string) =>
    data?.domainScores?.find((d: any) => d.domain === domain)?.score || 0;

  const domains = ["cognitive", "recovery", "friction"];

  const results = domains.map((domain) => {
    const base = getScore(baseline, domain);
    const current = getScore(latestWeekly, domain);
    const delta = current - base;

    return {
      domain,
      base: Math.round(base),
      current: Math.round(current),
      delta: Math.round(delta),
    };
  });

  /* =========================
     NKPI TREND
  ========================= */

  const nkpiDelta = latestWeekly.nkpi - (prevWeekly?.nkpi || latestWeekly.nkpi);

  const nkpiTrend = nkpiDelta > 2 ? "up" : nkpiDelta < -2 ? "down" : "stable";

  /* =========================
     LABELS
  ========================= */

  const domainLabel: Record<string, string> = {
    cognitive: "Cognitive",
    recovery: "Recovery",
    friction: "Friction",
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* HEADER */}
      <div className="mb-8">
        <h4 className="text-2xl text-white font-semibold mb-1">
          Week {latestWeekly.week.toString().padStart(2, "0")} Result
        </h4>

        <p className="text-gray-400 text-sm">
          Your performance compared to baseline
        </p>
      </div>

      {/* NKPI */}
      <Card className="p-6 mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm mb-1">NKPI Score</p>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold text-white">
              {latestWeekly.nkpi}
            </span>

            <span
              className={`text-sm font-medium ${
                nkpiTrend === "up"
                  ? "text-green-400"
                  : nkpiTrend === "down"
                    ? "text-red-400"
                    : "text-gray-400"
              }`}
            >
              {nkpiTrend === "up" && "↑ Improving"}
              {nkpiTrend === "down" && "↓ Declining"}
              {nkpiTrend === "stable" && "• Stable"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Change</p>
          <p
            className={`font-semibold ${
              nkpiDelta > 0
                ? "text-green-400"
                : nkpiDelta < 0
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {nkpiDelta > 0 ? "+" : ""}
            {Math.round(nkpiDelta)}
          </p>
        </div>
      </Card>

      {/* DOMAIN RESULTS */}
      <Card className="p-6 space-y-6">
        {results.map((item) => (
          <div key={item.domain}>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-white font-medium">
                {domainLabel[item.domain]}
              </h6>

              <span
                className={`text-sm ${
                  item.delta > 0
                    ? "text-green-400"
                    : item.delta < 0
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {item.delta > 0 && "↑"}
                {item.delta < 0 && "↓"}
                {item.delta === 0 && "•"}
              </span>
            </div>

            {/* BAR */}
            {/* BAR */}
            <div className="relative h-2 bg-[#1A222C] rounded">
              {(() => {
                const domainColor =
                  DOMAIN_COLORS[item.domain]?.color || "#3B82F6";

                return (
                  <div
                    className="absolute h-2 rounded transition-all"
                    style={{
                      width: `${item.current}%`,
                      background: domainColor,
                    }}
                  />
                );
              })()}
            </div>

            {/* VALUES */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Baseline {item.base}</span>
              <span>Now {item.current}</span>
            </div>
          </div>
        ))}

        {/* INSIGHT */}
        <div className="pt-4 border-t border-[#30363F] text-sm text-gray-400 leading-relaxed">
          Focus on consistency. Short-term fluctuations are normal, but steady
          improvement in recovery and cognitive capacity drives long-term
          performance.
        </div>

        {/* ACTION */}
        <div className="flex justify-end pt-2">
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
