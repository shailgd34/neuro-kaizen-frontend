import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBaselineResults } from "../../api/baselineApi";

import KpiCard from "../../components/client/Dashboard/KpiCard";
import DriftCard from "../../components/client/Dashboard/DriftCard";
import DomainList from "../../components/client/Dashboard/DomainList";
import TrendChart from "../../components/client/Dashboard/TrendChart";
import Insights from "../../components/client/Dashboard/Insights";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DriftAnalysisCard from "../../components/client/Dashboard/DriftAnalysisCard";
import DecisionCard from "../../features/baseline/components/DecisionCard";

const PerformanceDashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-scores"],
    queryFn: () => getBaselineResults(),
  });

  if (isLoading) {
    return (
      <Card className="text-white p-6 min-h-60 flex justify-center items-center text-center">
        Loading...
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="text-red-500 p-6 min-h-60 flex justify-center items-center text-center">
        Error loading dashboard
      </Card>
    );
  }

  const apiData = data?.data;
  const mode = data?.data.mode;

  // 🔒 Only allow analysis mode
  if (apiData?.mode !== "analysis") {
    navigate("/weekly");
    return null;
  }

  // =========================
  // DATA MAPPING
  // =========================

  const domains = apiData?.analysis?.domains || [];
  const summary = apiData?.analysis?.summary;

  const weekly =
    apiData?.submissions?.filter((s: any) => s.type === "weekly") || [];

  const latest = [...weekly].sort((a, b) => b.week - a.week)[0];

  const trend = weekly.map((w: any) => ({
    week: w.week,
    nkpi: w.nkpi,
  }));

  const overallDrift = domains.reduce(
    (worst: { zScore: number }, d: { zScore: number }) => {
      return Math.abs(d.zScore) > Math.abs(worst.zScore) ? d : worst;
    },
    domains[0],
  );

  const driftStatus =
    overallDrift.zScore <= -2
      ? "critical"
      : overallDrift.zScore <= -1
        ? "warning"
        : "normal";

  // =========================
  // UI
  // =========================

  return (
    <div className="p-6 text-white space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-2xl font-semibold">
            6-Week Performance Analysis Report
          </h4>
          <p className="text-gray-400 text-sm mt-2">
            Behavioral insights based on your calibration phase
          </p>
        </div>
      </div>

      {/* 🚨 ALERT */}
      {summary?.overallStatus === "at_risk" && (
        <Card className="p-4 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-medium mb-1">
            ⚠️ Performance Risk Detected
          </p>
          <p className="text-sm text-gray-400">{summary?.pattern}</p>
        </Card>
      )}

      {/* KPI + DRIFT */}
      <div className="flex gap-4">
        <div className="flex-1">
          <KpiCard
            data={{
              value: latest?.nkpi || 0,
              baseline: apiData?.submissions?.[0]?.nkpi || 0,
              driftStatus,
            }}
            mode="analysis"
          />
        </div>

        <div className="flex-2 w-full">
          <DriftCard
            drift={domains.map((d: any) => ({
              domain: d.domain,
              zScore: d.zScore,
              drift: d.drift,
            }))}
            mode="analysis"
          />
        </div>
      </div>

      {/* TREND */}
      <TrendChart trend={trend} mode="analysis" />

      {/* DOMAIN SECTION */}
      <Card>
        <h6 className="mb-4">Domain Performance Overview</h6>

        <DomainList
          domains={domains.map((d: any) => ({
            key: d.domain,
            label: d.domain.toUpperCase(),
            score: Math.round(d.current),

            direction:
              d.domain === "friction" ? "lower_better" : "higher_better",

            volatility: {
              level:
                Math.abs(d.zScore) > 1.5
                  ? "high"
                  : Math.abs(d.zScore) > 1
                    ? "moderate"
                    : "low",
            },

            drift: {
              status: d.drift,
            },
          }))}
          mode="active"
        />
      </Card>

      <Insights
        insights={[
          summary?.pattern,
          `Primary Issue: ${summary?.primaryIssue}`,
          `Secondary Issue: ${summary?.secondaryIssue}`,
        ].filter(Boolean)}
        mode="analysis"
      />

      {/* 🚀 PHASE 2 CTA */}
      <Card className="p-4 flex justify-between items-center">
        <div>
          <p className="text-white font-medium">Deep Diagnostic Available</p>
          <p className="text-gray-400 text-sm">
            Identify root causes of performance decline
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/phase2")}
          className=""
        >
          Start Diagnostic
        </Button>
      </Card>

      <DriftAnalysisCard domains={domains} mode={mode} />
      <DecisionCard domains={domains} mode={mode} />
    </div>
  );
};

export default PerformanceDashboard;
