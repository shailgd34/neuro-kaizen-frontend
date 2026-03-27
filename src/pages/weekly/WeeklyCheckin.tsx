import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";
import { getBaselineResults, submitWeeklyCheckin } from "../../api/baselineApi";
import LikertScale from "./../../features/baseline/components/LikertScale";
import RangeSlider from "../../components/ui/RangeSlider";

import { DOMAIN_COLORS } from "./../../constants/domains";

export default function WeeklyCheckin() {
  const navigate = useNavigate();

  const {
    data: baselineData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["client-scores"],
    queryFn: () => getBaselineResults(),
  });

  const weeklyStatus = baselineData?.data?.weeklyStatus;
  const week = weeklyStatus?.currentWeek || 1;
  const isLocked = weeklyStatus?.isLocked;
  const isSubmitted = weeklyStatus?.isCurrentWeekSubmitted;
  const isBaselineCompleted = baselineData?.data?.isBaselineCompleted === true;
const mode = baselineData?.data?.mode;
  const remainingTime = weeklyStatus?.remainingTime || 0;
  const [timeLeft, setTimeLeft] = useState(remainingTime);

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
  if (mode === "analysis") {
    navigate("/performance-analytics");
  }
}, [mode, navigate]);

  /* =========================
     FORM STATE
  ========================= */

  const [form, setForm] = useState({
    sleep: 7,
    recovery: 4,
    clarity: 4,
    friction: 4,
    reflection: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const submitMutation = useMutation({
    mutationFn: () =>
      submitWeeklyCheckin({
        week,
        ...form,
      }),
    onSuccess: async () => {
  toast.success("Weekly check-in submitted");

  const res = await refetch();
  const mode = res?.data?.data?.mode;

  if (mode === "analysis") {
    navigate("/performance-analytics");
  } else {
    navigate("/weekly/result");
  }
},
    onError: () => {
      toast.error("Something went wrong. Try again.");
    },
  });

  const submissions = baselineData?.data?.submissions || [];

  const lastWeekly = [...submissions]
    .filter((s: any) => s.type === "weekly")
    .sort((a: any, b: any) => b.week - a.week)[0];

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  useEffect(() => {
    if (!isLocked) return;

    if (timeLeft === 0) {
      refetch();

      const timeout = setTimeout(() => {
        refetch(); // second hit (ensures backend updated)
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [timeLeft, isLocked, refetch]);

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading...
      </div>
    );
  }

  if (!isBaselineCompleted) {
    return (
      <Card className="flex justify-center items-center h-[60vh] text-center">
        <div>
          <h5 className="text-white text-xl mb-2">Weekly Check-In Locked</h5>

          <p className="text-gray-400 mb-4">
            Complete baseline assessment to unlock weekly tracking.
          </p>

          <Button onClick={() => navigate("/baseline")}>Go to Baseline</Button>
        </div>
      </Card>
    );
  }

  /* =========================
     LOCK SCREEN
  ========================= */

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="text-center mb-8">
          <span className="bg-blue-500/10 text-blue-500 border boder-blue-500 px-2 py-1 text-sm rounded mb-3">
            Week 0{week}
          </span>
          <h4 className="text-2xl text-white font-semibold mb-2 mt-3">
            🔒 Weekly Check-In Locked
          </h4>
          <p className="text-gray-400 text-sm">
            Next check-in week unlocks automatically
          </p>
        </div>

        {/* COUNTDOWN CARD */}
        <Card className="mb-6 text-center relative">
          {/* <span className="bg-blue-500/10 text-blue-500 border boder-blue-500 px-2 py-1 text-sm rounded absolute right-3 top-3" >Week 0{week}</span> */}
          <p className="text-gray-400 text-sm mb-2">Unlocks In</p>

          <div className="text-4xl font-bold text-green-500 font-mono tracking-wide">
            {formatTime(timeLeft)}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Stay consistent — next window opens soon
          </p>
        </Card>

        {/* LAST WEEK RESULT */}
        {lastWeekly && (
          <Card>
            <div className="mb-4">
              <h6 className="text-white text-lg font-semibold">
                Week {String(lastWeekly.week).padStart(2, "0")} Summary
              </h6>
              <p className="text-gray-400 text-sm">
                Your most recent performance snapshot
              </p>
            </div>

            {/* NKPI */}
            <div className="bg-[#0F141A] border border-[#30363F] rounded p-4 mb-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">NKPI Score</span>
              <span className="text-xl font-semibold text-white">
                {lastWeekly.nkpi}
              </span>
            </div>

            <div className="space-y-3">
              {lastWeekly.domainScores.map((d: any, i: number) => {
                const domain = DOMAIN_COLORS[d.domain];

                return (
                  <div key={i} className=" mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2 items-center">
                      {/* LEFT: LABEL + COLOR DOT */}
                      <div className="flex items-center gap-6">
                        <span>{domain?.label || d.domain}</span>
                      </div>

                      {/* RIGHT: SCORE */}
                      <span className="text-white font-medium">
                        {Math.round(d.score)}%
                      </span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="w-full h-2 bg-[#1C2128] rounded overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${d.score}%`,
                          backgroundColor: domain?.color || "#3B82F6",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACTION */}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => navigate("/weekly/result")}>
                View Full Report
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (!isBaselineCompleted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <Card className="text-center">
          <h5 className="text-white text-xl mb-2">🔒 Weekly Tracking Locked</h5>

          <p className="text-gray-400 mb-6 text-sm">
            Complete your baseline assessment to unlock weekly tracking.
          </p>

          <Button onClick={() => navigate("/baseline")}>Start Baseline</Button>
        </Card>
      </div>
    );
  }
  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className=" mx-auto px-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div className="mb-4">
          <h5 className="text-2xl text-white font-semibold">
            Weekly Check-In — Week {String(week).padStart(2, "0")}
          </h5>
          <p className="text-gray-400 text-sm mt-1">
            Track your short-term performance signals.
          </p>
        </div>

        <div className="text-xs text-gray-400 bg-[#0F141A] border border-[#30363F] px-3 py-3 rounded">
          Calibration Phase — Week {week} of 6
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="space-y-4">
        {/* SLEEP */}
        <Card>
          <label className="text-gray-300 block mb-2">
            How many hours did you sleep on average this week?
          </label>

          <RangeSlider
            value={form.sleep}
            min={0}
            max={12}
            step={0.5}
            unit="hrs"
            leftLabel="Poor sleep"
            rightLabel="Optimal sleep"
            onChange={(val) => handleChange("sleep", val)}
          />
        </Card>

        {/* RECOVERY */}
        <Card>
          <label className="text-gray-300 block mb-6">
            How well did your body recover this week?
          </label>

          <LikertScale
            value={form.recovery}
            onChange={(v) => handleChange("recovery", v)}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </Card>

        {/* CLARITY */}
        <Card>
          <label className="text-gray-300 block mb-6">
            How clear and focused was your thinking?
          </label>

          <LikertScale
            value={form.clarity}
            onChange={(v) => handleChange("clarity", v)}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </Card>

        {/* FRICTION */}
        <Card>
          <label className="text-gray-300 block mb-6">
            How much friction or disruption did you experience?
          </label>

          <LikertScale
            value={form.friction}
            onChange={(v) => handleChange("friction", v)}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </Card>

        {/* REFLECTION */}
        <Card>
          <label className="text-gray-300 block mb-4">
            What affected your performance this week? (optional)
          </label>

          <textarea
            value={form.reflection}
            onChange={(e) => handleChange("reflection", e.target.value)}
            rows={4}
            className="w-full p-3 bg-[#0F141A] border border-[#30363F] rounded text-white"
            placeholder="Describe anything that impacted your performance..."
          />
        </Card>

        {/* ACTION */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || isSubmitted}
          >
            {submitMutation.isPending
              ? "Submitting..."
              : "Submit Weekly Check-In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
