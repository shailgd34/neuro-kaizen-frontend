import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Clock, ChevronRight, Brain, ShieldAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";
import { getBaselineResults, submitWeeklyCheckin } from "../../api/baselineApi";
import LikertScale from "./../../features/baseline/components/LikertScale";
import RangeSlider from "../../components/ui/RangeSlider";

export default function WeeklyCheckin() {
  const navigate = useNavigate();

  const {
    data: baselineData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["assessment-results"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = baselineData?.data;
  const calibration = apiData?.calibration;
  const baseline = apiData?.baseline;
  const week = calibration?.currentWeek || 1;
  const remainingTime = calibration?.remainingTime || 0;
  const isLocked = remainingTime > 0;
  const isMetricsSubmitted = calibration?.isWeekSubmitted || false;

  const [timeLeft, setTimeLeft] = useState(remainingTime);

  const [targetDate, setTargetDate] = useState(
    () => Date.now() + remainingTime * 1000,
  );

  useEffect(() => {
    const newTarget = Date.now() + remainingTime * 1000;
    if (Math.abs(newTarget - targetDate) > 2000) {
      setTargetDate(newTarget);
    }
  }, [remainingTime, targetDate]);

  useEffect(() => {
    if (!isLocked || timeLeft <= 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((targetDate - now) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) refetch();
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, targetDate, timeLeft, refetch]);

  useEffect(() => {
    if (isLoading || !apiData) return;
    if (
      apiData.userState === "baseline_pending" ||
      apiData.baseline?.status !== "completed"
    ) {
      navigate("/baseline");
    }
  }, [apiData, isLoading, navigate]);

  const [form, setForm] = useState({
    sleep: 7,
    recovery: 4,
    clarity: 4,
    friction: 4,
    flow: 4,        // NEW
  identity: 4, 
    reflection: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitMetrics = useMutation({
    mutationFn: () => submitWeeklyCheckin({ week, ...form }),
    onSuccess: () => {
      toast.success("Check-in submitted");
      navigate("/weekly/result");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  useEffect(() => {
    if (isMetricsSubmitted && !isLoading && remainingTime > 0) {
      navigate("/weekly/result", { replace: true });
    }
  }, [isMetricsSubmitted, isLoading, remainingTime, navigate]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading...
      </div>
    );

  if (!baseline) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <Card className="text-center border-rose-500/20 bg-rose-500/5">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h5 className="text-white text-xl mb-2 font-semibold">
            Baseline Not Completed
          </h5>
          <p className="text-gray-400 mb-6 text-sm">
            You need to complete the baseline assessment before starting weekly
            check-ins.
          </p>
          <Button variant="goldDark" onClick={() => navigate("/baseline")}>
            Start Baseline
          </Button>
        </Card>
      </div>
    );
  }

  /* ── LOCKED STATE ──────────────────────────────────────────── */
  const currentWeek = apiData?.weeklyStatus?.currentWeek || 0;
  const isCurrentWeekSubmitted = apiData?.weeklyStatus?.isCurrentWeekSubmitted || false;
  
  // Hide the insights button only if we are on week 1 and haven't submitted it yet
  const hideInsightsButton = currentWeek === 1 && isCurrentWeekSubmitted === false;
  const hasResults = !hideInsightsButton;
  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-1000">
        <Card className="relative overflow-hidden bg-[#0A0D11] border-white/5 p-10 md:p-16 text-center shadow-2xl">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full mix-blend-screen opacity-50 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full mix-blend-screen opacity-50" />

          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary blur-2xl opacity-20 animate-pulse rounded-full" />
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#0A0D11] border border-secondary/20 shadow-inner relative z-10">
                  <Clock className="w-8 h-8 text-secondary drop-shadow-[0_0_10px_rgba(237,220,144,0.6)]" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/5 text-gray-400 px-3 py-1 rounded-lg border border-white/5 text-[10px] font-bold uppercase tracking-wider mb-6">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
              Check-in cooldown active
            </div>

            <h4 className="text-white font-bold text-2xl md:text-3xl tracking-tight mb-8">
              Your next check-in unlocks in
            </h4>

            <div className="flex justify-center gap-3 sm:gap-6 mb-12">
              {formatTime(timeLeft)
                .split(":")
                .map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="bg-cardBg border border-white/5 shadow-inner p-4 sm:p-6 rounded-2xl min-w-17.5 sm:min-w-25 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent" />
                      <span className="text-4xl sm:text-6xl font-bold text-white font-mono tracking-tighter drop-shadow-md relative z-10">
                        {unit}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-4 opacity-70">
                      {i === 0 ? "Hours" : i === 1 ? "Minutes" : "Seconds"}
                    </p>
                  </div>
                ))}
            </div>

            {hasResults && (
              <div className="max-w-md mx-auto pt-8 border-t border-white/5">
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Your performance profile is currently calibrating based on your
                  last submission.
                </p>
                <Button
                  variant="goldDark"
                  className="w-full h-12 font-bold shadow-[0_0_20px_rgba(237,220,144,0.1)] flex justify-center items-center gap-2 group"
                  onClick={() => navigate("/weekly/result")}
                >
                  View Latest Insights{" "}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const phase2 = apiData?.phase2;
  const isPhase2Active = phase2?.triggered && phase2?.status !== "completed";

  /* ── CHECK-IN FORM ─────────────────────────────────────────── */
  return (
    <div className="mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <p className="text-secondary text-xs font-medium mb-1">
            Week {week} of {calibration?.totalWeeks || 6}
          </p>
          <h4 className="text-white font-semibold">Weekly Check-in</h4>
          <p className="text-gray-400 text-sm mt-1">
            Share how your week went. This helps track your performance over
            time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Form */}
        <div className="xl:col-span-3 space-y-4">
          <Card>
            <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-secondary" /> Average sleep this
              week
            </label>
            <RangeSlider
              value={form.sleep}
              min={0}
              max={12}
              step={0.5}
              unit="hrs"
              leftLabel="Poor sleep"
              rightLabel="Well rested"
              onChange={(val) => handleChange("sleep", val)}
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-5">
                Recovery level
              </label>
              <LikertScale
                value={form.recovery}
                onChange={(v) => handleChange("recovery", v)}
              />
            </Card>

            <Card>
  <label className="text-gray-300 text-sm font-medium mb-5">
    How focused were you this week?
  </label>
  <LikertScale
    value={form.flow}
    onChange={(v) => handleChange("flow", v)}
  />
</Card>

<Card>
  <label className="text-gray-300 text-sm font-medium mb-5">
    How aligned did your actions feel with your goals?
  </label>
  <LikertScale
    value={form.identity}
    onChange={(v) => handleChange("identity", v)}
  />
</Card>

            <Card>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-5">
                Cognitive clarity
              </label>
              <LikertScale
                value={form.clarity}
                onChange={(v) => handleChange("clarity", v)}
              />
            </Card>
          </div>

          <Card>
            <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-5">
              Perceived friction / resistance
            </label>
            <LikertScale
              value={form.friction}
              onChange={(v) => handleChange("friction", v)}
            />
          </Card>

          <Card className="border-dashed bg-white/1">
            <label className="text-gray-400 text-sm font-medium flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-gray-500" /> Reflection (optional)
            </label>
            <textarea
              value={form.reflection}
              onChange={(e) => handleChange("reflection", e.target.value)}
              rows={3}
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white focus:border-secondary/50 outline-none text-sm leading-relaxed"
              placeholder="Any notes about your week..."
            />
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              className="min-w-45 h-11 font-medium text-sm"
              onClick={() => submitMetrics.mutate()}
              disabled={submitMetrics.isPending || isMetricsSubmitted}
            >
              {submitMetrics.isPending ? "Submitting..." : "Submit Check-in"}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {isPhase2Active ? (
            <Card className="border-secondary/20 bg-secondary/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary text-xs font-medium">
                  Diagnostic pending
                </span>
              </div>
              <p className="text-white text-sm font-medium mb-1">
                Deep diagnostic: {phase2.targetDomain}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                A deeper assessment was triggered for your{" "}
                <span className="text-white capitalize">
                  {phase2.targetDomain}
                </span>{" "}
                domain.
              </p>
              <Button
                variant="goldDark"
                className="w-full text-xs font-medium h-9"
                onClick={() => navigate("/phase2")}
              >
                Start Diagnostic <ChevronRight className="ml-1 w-3 h-3" />
              </Button>
            </Card>
          ) : (
            <Card className="border-white/5 bg-white/2 border-dashed">
              <p className="text-gray-500 text-xs font-medium mb-2">Status</p>
              <p className="text-gray-400 text-sm">
                No issues detected this cycle. All domains are within range.
              </p>
            </Card>
          )}

          <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-2xl">
            <p className="text-secondary text-xs font-medium mb-1">Tip</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Consistent sleep and clarity scores give the most accurate results
              over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
