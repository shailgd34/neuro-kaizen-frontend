import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import GaugeComponent from "react-gauge-component";
import { getDraftStatusConfig } from "../../features/baseline/utils/status";
import Card from "../../components/ui/Card";
import { getBaselineResults } from "../../api/baselineApi";

export default function BaselineResults() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["assessment-results", "baseline"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;
  const weeklyStatus = apiData?.weeklyStatus;
  const currentWeek = weeklyStatus?.currentWeek || 1;
  const isSubmitted = weeklyStatus?.isCurrentWeekSubmitted;
  const isLocked = weeklyStatus?.isLocked;

  const results = useMemo(() => {
    if (!apiData?.submissions) return null;

    return apiData.submissions.find((s: any) => s.type === "baseline");
  }, [apiData]);

  const [, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const draftStatus = apiData?.draftStatus;
  const currentStatus = getDraftStatusConfig(draftStatus);
  const remainingTime = weeklyStatus?.remainingTime || 0;

  // format helper
  const format = (num: number) => String(num).padStart(2, "0");

  const compositeScore = Math.round(results?.nkpi || 0);
  const [animatedValue, setAnimatedValue] = useState(0);

  const [timeLeft, setTimeLeft] = useState(remainingTime);
 
  const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  useEffect(() => {
    if (!compositeScore) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const increment = compositeScore / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;

      if (start >= compositeScore) {
        setAnimatedValue(compositeScore);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [compositeScore]);

  const domainMeta: Record<string, { label: string; color: string }> = {
    cognitive: {
      label: "Cognitive Capacity",
      color: "#3B82F6",
    },
    recovery: {
      label: "Recovery & Readiness",
      color: "#A855F7",
    },
    flow: {
      label: "Immersion & Flow",
      color: "#EAB308",
    },
    identity: {
      label: "Strategic Identity & Alignment",
      color: "#EC4899",
    },
    friction: {
      label: "Friction Load (Lower is Better)",
      color: "#F97316",
    },
  };

  const [animatedScores, setAnimatedScores] = useState<number[]>([]);

  const scores = useMemo(() => {
    if (!results?.domainScores) return [];

    return results.domainScores.map((item: any) => ({
      name: domainMeta[item.domain]?.label || item.domain,
      value: Math.round(item.score),
      color: domainMeta[item.domain]?.color || "#999",
    }));
  }, [results]);

  // const nextWeekNumber = useMemo(() => {
  //   if (!apiData?.submissions) return 1;

  //   const weekly = apiData.submissions.filter((s: any) => s.type === "weekly");

  //   if (!weekly.length) return 1;

  //   const lastWeek = Math.max(...weekly.map((s: any) => s.week));
  //   return lastWeek + 1;
  // }, [apiData]);

  const weeklySubmissions = useMemo(() => {
    if (!apiData?.submissions) return [];

    return apiData.submissions.filter((s: any) => s.type === "weekly");
  }, [apiData]);

  const completedWeeks = weeklySubmissions.length;
  const totalWeeks = 6;
  const isCalibrationComplete = completedWeeks >= totalWeeks;

  const lastCompletedWeek =
    completedWeeks > 0
      ? Math.max(...weeklySubmissions.map((s: any) => s.week))
      : null;

  const formatWeek = (week: number) => String(week).padStart(2, "0");

  if (!results && !isLoading) {
    return (
      <div className="text-center text-gray-400 mt-20">
        No results available.
      </div>
    );
  }

  useEffect(() => {
    if (!scores.length) return;

    setAnimatedScores(new Array(scores.length).fill(0));

    const timer = setTimeout(() => {
      setAnimatedScores(scores.map((s: { value: any }) => s.value));
    }, 200);

    return () => clearTimeout(timer);
  }, [scores]);

  useEffect(() => {
    if (!isLocked) return;

    if (timeLeft === 0) {
      refetch(); // 🔥 fetch latest API state
    }
  }, [timeLeft, isLocked, refetch]);

  return (
    <>
      <Card className="max-w-8xl mx-auto py-6 px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-75 text-gray-400">
            Loading results...
          </div>
        ) : (
          <>
            {/* HEADER */}

            <div className="flex justify-between items-center mb-6">
              <div>
                <h5 className="text-2xl text-white font-semibold">
                  Baseline Results
                </h5>

                <p className="text-gray-400 text-sm">
                  Baseline Generated • Calibration Phase Active
                </p>
              </div>
              <p>
                Draft Status:{" "}
                <span className={currentStatus.color}>
                  {currentStatus.label}
                </span>
              </p>
            </div>

            {/* CALIBRATION CARD */}

            <div className="bg-[#0F141A] border border-[#30363F] p-5 rounded-lg mb-6 flex justify-between items-center">
              {/* LEFT SIDE */}
              <div className="flex gap-4 items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCalibrationComplete
                      ? "bg-emerald-400 text-black"
                      : "bg-green-500 text-black"
                  }`}
                >
                  {isCalibrationComplete ? "✓" : "✓"}
                </div>

                <div>
                  <p className="text-white font-medium">
                    {isCalibrationComplete
                      ? "Calibration Complete"
                      : "Calibration Phase Active"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {isCalibrationComplete
                      ? "All calibration weeks completed"
                      : `${completedWeeks} / ${totalWeeks} calibration weeks completed`}
                  </p>

                  {isCalibrationComplete ? (
                    <p className="text-xs text-emerald-400 mt-1">
                      Drift analysis is now available
                    </p>
                  ) : lastCompletedWeek ? (
                    <p className="text-xs text-green-400 mt-1">
                      Week {formatWeek(lastCompletedWeek)} completed ✓
                    </p>
                  ) : null}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-right">
                {isCalibrationComplete ? (
                  <div>
                    <p className="font-semibold text-lg">
                      ✓ Drift Score Generated
                    </p>

                    <button
                      onClick={() => navigate("/performance-analytics")}
                      className="mt-1 text-xs underline text-green-500"
                    >
                      View Performance Dashboard
                    </button>
                  </div>
                ) : isLocked ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1">
                      Next check-in available in
                    </p>

                    <p className="text-green-500 font-mono text-xl tracking-widest">
                      {format(hours)}:{format(minutes)}:{format(seconds)}
                    </p>
                  </>
                ) : isSubmitted ? (
                  <button
                    onClick={() => navigate("/weekly/result")}
                    className="bg-white text-black px-5 py-2 rounded font-semibold hover:bg-gray-200"
                  >
                    View Week {formatWeek(currentWeek)} Result
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/weekly")}
                    className="bg-white text-black px-5 py-2 rounded font-semibold hover:bg-gray-200"
                  >
                    Start Week {formatWeek(currentWeek)} Check-In
                  </button>
                )}
              </div>
            </div>

            {/* MAIN RESULT CARD */}

            <div className="bg-[#0F141A] border border-[#30363F] p-8 rounded-lg grid grid-cols-2 gap-10">
              {/* DOMAIN SCORES */}

              <div className="">
                <h5 className="text-white font-semibold mb-2">Domain Scores</h5>

                <p className="text-gray-500 text-sm mb-6">
                  Mental processing and decision quality
                </p>

                {scores.map((score: any, index: number) => (
                  <div key={score.name} className="mb-8">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{score.name}</span>
                      <h6 className="text-white font-bold">{score.value}</h6>
                    </div>

                    <div className="w-full h-2 bg-[#1A222C] rounded">
                      <div
                        className="h-2 rounded transition-all duration-1000"
                        style={{
                          width: `${
                            score.name.includes("Friction")
                              ? 100 - (animatedScores[index] || 0)
                              : animatedScores[index] || 0
                          }%`,
                          backgroundColor: score.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* GAUGE */}

              {/* GAUGE */}

              <div className="flex flex-col items-center justify-center">
                <h6 className="text-gray-200">
                  Composite NKPI Score: {compositeScore}
                </h6>
                <p className="text-sm text-gray-400 mt-2">
                  {compositeScore < 40 && "High systemic strain detected"}
                  {compositeScore >= 40 &&
                    compositeScore < 60 &&
                    "Moderate performance stability"}
                  {compositeScore >= 60 &&
                    compositeScore < 80 &&
                    "Stable performance range"}
                  {compositeScore >= 80 && "High optimisation zone"}
                </p>

                <div className="w-96 h-96 flex items-center justify-center">
                  <GaugeComponent
                    value={animatedValue}
                    minValue={0}
                    maxValue={100}
                    type="radial"
                    arc={{
                      subArcs: [
                        { limit: 40, color: "#EF4444" },
                        { limit: 70, color: "#FACC15" },
                        { limit: 100, color: "#22C55E" },
                      ],
                      width: 0.3,
                    }}
                    pointer={{ elastic: true }}
                    labels={{
                      valueLabel: {
                        style: {
                          fill: "#ffffff",
                          fontSize: "32px",
                          fontWeight: "bold",
                        },
                      },
                    }}
                  />
                </div>

                <p className="text-gray-500 -mt-20">Composite NKPI</p>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="mt-6 border border-[#30363F] px-6 py-2 rounded text-gray-300 hover:bg-[#1A222C]"
                >
                  Proceed to Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
      <div className="bg-[#0F141A] border border-[#30363F] p-5 rounded-lg mb-6 mt-6">
        <p className="text-gray-400 text-sm">
          Your baseline establishes the reference point for performance
          tracking. Weekly check-ins will monitor changes in cognitive capacity,
          recovery, immersion, identity alignment, and systemic friction.
        </p>
      </div>
    </>
  );
}
