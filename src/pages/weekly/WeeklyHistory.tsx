import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Card from "../../components/ui/Card";
import { getBaselineResults } from "../../api/baselineApi";


export default function WeeklyHistory() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["client-scores"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;

  /* =======================
     NORMALIZE DATA
  ======================= */

  const history = useMemo(() => {
    const submissions = apiData?.submissions || [];

    return submissions.map((item: any) => {
      let status: "completed" | "pending" = "pending";

      if (item.type === "baseline" || item.type === "weekly") {
        status = "completed";
      }

      return {
        week: item.week,
        status,
        nkpi: item.nkpi ?? null,
        submittedAt: item.submittedAt ?? null,
        isCurrentWeek:
          item.week === apiData?.weeklyStatus?.currentWeek,
        domainScores: item.domainScores || [],
      };
    });
  }, [apiData]);

  /* =======================
     TREND DATA
  ======================= */

 

  const baselineNkpi =
    history.find((h: { week: number; }) => h.week === 0)?.nkpi || 0;

  /* =======================
     UPCOMING (COUNTDOWN)
  ======================= */

 

  
  

  

  /* =======================
     HELPERS
  ======================= */

  const formatWeek = (week: number) =>
    week === 0 ? "Baseline" : `Week ${String(week).padStart(2, "0")}`;

  const getStatusStyle = (status: string) => {
    return status === "completed"
      ? "bg-green-500/10 text-green-400"
      : "bg-yellow-500/10 text-yellow-400";
  };

  const domainMeta: Record<string, { label: string }> = {
    cognitive: { label: "Cognitive" },
    recovery: { label: "Recovery" },
    friction: { label: "Friction" },
    flow: { label: "Flow" },
    identity: { label: "Identity" },
  };

  /* =======================
     BASELINE DOMAIN MAP
  ======================= */

  const baselineDomains: Record<string, number> = {};

  history
    .find((h: { week: number; }) => h.week === 0)
    ?.domainScores?.forEach((d: any) => {
      baselineDomains[d.domain] = Math.round(d.score);
    });

  /* =======================
     LOADING
  ======================= */

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading history...
      </div>
    );
  }

  /* =======================
     UI
  ======================= */

  return (
    <Card className="l mx-auto p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h4 className="text-2xl text-white font-semibold">
          Weekly Performance
        </h4>
        <p className="text-gray-400 text-sm">
          Track your performance over time
        </p>
      </div>

      

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {history.map((item :any) => {
          const delta =
            item.nkpi !== null
              ? item.nkpi - baselineNkpi
              : null;

          return (
            <div
              key={item.week}
              onClick={() =>
                item.status === "completed" &&
                navigate(`/weekly/result?week=${item.week}`)
              }
              className={`p-6 rounded-xl border h-72 flex flex-col justify-between
              ${
                item.status === "completed"
                  ? "cursor-pointer hover:scale-[1.01] transition bg-[#0F141A] border-[#30363F]"
                  : "bg-[#0F141A] border-[#30363F] opacity-70"
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between">
                <h6 className="text-white font-semibold">
                  {formatWeek(item.week)}
                </h6>
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              {/* NKPI */}
              <div>
                <p className="text-xs text-gray-500">NKPI</p>

                <div className="flex items-center gap-2">
                  <h4 className="text-3xl text-white font-semibold">
                    {item.nkpi ? Math.round(item.nkpi) : "--"}
                  </h4>

                  {delta !== null && item.week !== 0 && (
                    <span
                      className={`text-sm ${
                        delta > 0
                          ? "text-green-400"
                          : delta < 0
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {delta > 0 && "↑"}
                      {delta < 0 && "↓"}
                    </span>
                  )}
                </div>

                {item.week !== 0 && (
                  <p className="text-xs text-gray-500">
                    Base: {Math.round(baselineNkpi)}
                  </p>
                )}
              </div>

              {/* DOMAINS */}
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(domainMeta).map((key) => {
                  const current = item.domainScores?.find(
                    (d: any) => d.domain === key
                  );

                  const currentVal = current
                    ? Math.round(current.score)
                    : null;

                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {domainMeta[key].label}
                        </span>

                        <span className="text-white">
                          {currentVal ?? "--"}
                        </span>
                      </div>

                      <div className="h-1 bg-[#1A222C] rounded mt-1">
                        <div
                          className="h-1 rounded bg-gray-400"
                          style={{
                            width: `${currentVal ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOT */}
              <p className="text-[11px] text-gray-500">
                {item.week === 0
                  ? "Baseline reference"
                  : "Compared to baseline"}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}