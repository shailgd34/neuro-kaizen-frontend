import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import Card from "../../components/ui/Card";
import { getDomainDetails } from "./../../api/DashboardApi";

/* ================= HELPERS ================= */

const formatDrift = (status: string) => {
  switch (status) {
    case "adaptive_strain":
      return "Adaptive Strain";
    case "stable":
      return "Stable";
    case "decline":
      return "Decline";
    case "recovery":
      return "Recovery";
    default:
      return status;
  }
};

const formatTrend = (trend: string) => {
  if (trend === "down") return "Slight Decline";
  if (trend === "up") return "Improving";
  return "Stable";
};

/* ================= COMPONENT ================= */

const DomainDetails = () => {
  const { domainId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["domain-details", domainId],
    queryFn: () => getDomainDetails(domainId as string),
    enabled: !!domainId,
  });

  if (isLoading || !data) {
    return <div className="text-white p-6">Loading domain insights...</div>;
  }

  const { snapshot, metrics, timeseries, insight, domainName } = data;

  return (
    <div className="p-6 text-white space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-semibold">{domainName}</h4>
          <p className="text-sm text-gray-400 mt-1">
            Current performance and trend over time
          </p>
        </div>

        <div className="text-right flex gap-3 items-center">
          <p className="text-xs text-gray-500">Drift:</p>
          <p className="text-sm font-medium text-yellow-400">
            {formatDrift(snapshot.driftStatus)}
          </p>
        </div>
      </div>

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT - SCORE */}
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-400">Current Score</p>

            <div className="flex items-end gap-3 mt-2">
              <p className="text-5xl font-semibold">{snapshot.currentScore}</p>

              <p
                className={`text-sm ${
                  snapshot.delta < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {snapshot.delta > 0 ? "+" : ""}
                {snapshot.delta}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Baseline: {snapshot.baselineScore}
            </p>
          </div>
        </Card>

        {/* RIGHT - METRICS */}
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">Performance Signals</p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Trend</span>
                <span className="text-white">{formatTrend(metrics.trend)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Stability</span>
                <span className="text-white">{metrics.volatility}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Average</span>
                <span className="text-white">{metrics.rollingAverage}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= CHART ================= */}
      <Card>
        <div className="p-5">
          <p className="text-sm text-gray-400 mb-1">Score Trend Over Time</p>
          <p className="text-xs text-gray-500 mb-4">
            Shows how your performance is evolving week by week
          </p>

          <div className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid stroke="#1f2937" />

                <XAxis
                  dataKey="week"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Weeks",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  stroke="#6b7280"
                  domain={[60, 100]}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                {/* Domain Score */}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="rollingAverage"
                  stroke="#9CA3AF"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* ================= INSIGHT ================= */}
      <Card>
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-2">Key Insight</p>

          <p className="text-sm text-gray-200 leading-relaxed">
            {insight.summary}
          </p>

          <p className="text-xs text-gray-500 mt-3">
            Updated: {insight.lastUpdated}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DomainDetails;
