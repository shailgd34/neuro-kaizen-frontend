import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import GaugeComponent from "react-gauge-component";
import {
  Zap,
  Activity,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  Info,
  CalendarCheck
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getBaselineResults } from "../../api/baselineApi";
import { DOMAIN_COLORS } from "../../constants/domains";

export default function BaselineResults() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["assessment-results", "baseline"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;
  const baseline = apiData?.baseline;
  const calibration = apiData?.calibration;
  const domains = apiData?.domains || apiData?.baseline?.domains || [];
  const currentWeek = calibration?.currentWeek || 1;
  const totalWeeks = calibration?.totalWeeks || 6;
  
  const initialRemainingTime = calibration?.remainingTime || 0;
  const [timeLeft, setTimeLeft] = useState(initialRemainingTime);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    setTimeLeft(calibration?.remainingTime || 0);
    setHasRefreshed(false);
  }, [calibration?.remainingTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (initialRemainingTime > 0 && !hasRefreshed) {
        setHasRefreshed(true);
        refetch();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, initialRemainingTime, hasRefreshed, refetch]);

  const isLocked = timeLeft > 0;
  const isSubmitted = calibration?.isWeekSubmitted;

  const compositeScore = Math.round(apiData?.nkpi || baseline?.score || 0);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!compositeScore) return;
    const duration = 1200;
    const stepTime = 20;
    const increment = compositeScore / (duration / stepTime);
    let start = 0;
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

  const scores = useMemo(() => {
    return domains.map((item: any) => ({
      domain: item.domain,
      label: DOMAIN_COLORS[item.domain]?.label || item.domain,
      value: Math.round(item.score),
      color: DOMAIN_COLORS[item.domain]?.color || "#EDDC90",
      status: item.status || "Stable",
      drift: item.drift || "Calculating stability...",
    }));
  }, [domains]);

  const completedWeeks = (calibration?.currentWeek || 1) - (isSubmitted || isLocked ? 0 : 1);
  const isCalibrationComplete = (calibration?.currentWeek || 0) > totalWeeks;


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-400 space-y-4">
        <Activity className="w-10 h-10 text-secondary animate-pulse" />
        <p className="text-sm font-medium">Loading results...</p>
      </div>
    );
  }

  if (!baseline || baseline.status !== "completed") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <ShieldAlert className="w-12 h-12 text-rose-500/50 mb-6" />
        <h4 className="text-white font-bold mb-2">Results Pending</h4>
        <p className="text-gray-500 max-w-sm mb-8 text-sm">
          You haven't completed your baseline assessment yet. Complete it to see your performance profile.
        </p>
        <Button variant="goldDark" className="px-10 h-11 text-xs font-semibold" onClick={() => navigate("/baseline")}>
          Start Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary text-xs font-medium mb-2 uppercase tracking-widest">
            Profile Architecture
          </div>
          <h4 className="text-white font-bold tracking-tight">Your Neural <span className="text-secondary">Signature</span></h4>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <p className="text-gray-500 text-[11px] font-bold uppercase flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              Baseline Assessment: <span className="text-emerald-400">{baseline?.status || "Completed"}</span>
            </p>
            <p className="text-gray-500 text-[11px] font-bold uppercase flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              System State: <span className="text-amber-500">{apiData?.userState || "Calibrating"}</span>
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-secondary/10 p-2.5 rounded-xl border border-secondary/20">
            <Zap className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Current Protocol</p>
            <h6 className="text-white font-bold text-lg leading-none">
              {apiData?.mode === "calibrating" ? "Calibration Phase" : "Maintenance Mode"}
            </h6>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-secondary/5 border-secondary/20 p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/20 shrink-0">
              <CalendarCheck className="w-6 h-6 text-black" />
            </div>
            <div className="space-y-1">
              <h5 className="text-white font-bold">
                {isCalibrationComplete ? "Protocol Stabilized" : "Calibration Protocol"}
              </h5>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                {isCalibrationComplete
                  ? "Your performance signature is now fully calibrated. System optimization data is now active."
                  : `Establishing your neural baseline (Week ${calibration?.currentWeek || 1} of ${totalWeeks}). The algorithm is fine-tuning your performance thresholds.`
                }
              </p>
              <div className="flex items-center gap-3 pt-3">
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${Math.min(100, (completedWeeks / totalWeeks) * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-secondary">{Math.round(Math.min(100, (completedWeeks / totalWeeks) * 100))}% Calibrated</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isCalibrationComplete ? (
              <Button variant="goldDark" className="w-full sm:w-auto text-xs" onClick={() => navigate("/dashboard")}>
                View Dashboard <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            ) : isLocked ? (
              <div className="bg-black/40 border border-white/5 px-6 py-2.5 rounded-2xl min-w-[160px]">
                <p className="text-[10px] text-gray-500 font-medium mb-1 text-center uppercase tracking-wider">Next batch in</p>
                <p className="text-emerald-400 font-mono text-xl font-bold text-center">
                  {Math.floor(timeLeft / 3600).toString().padStart(2, "0")}:
                  {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0")}:
                  {Math.floor(timeLeft % 60).toString().padStart(2, "0")}
                </p>
              </div>
            ) : isSubmitted ? (
              <Button variant="primary" className="w-full sm:w-auto text-xs" onClick={() => navigate("/weekly/result")}>
                Latest Results <TrendingUp className="ml-1 w-4 h-4" />
              </Button>
            ) : (
              <Button variant="goldDark" className="w-full sm:w-auto text-xs" onClick={() => navigate("/weekly")}>
                Start Week {currentWeek} Check-in <Zap className="ml-1 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Breakdown */}
        <Card className="lg:col-span-2 p-0 border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/1">
            <h5 className="text-white font-bold text-xl">Domain Scores</h5>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group cursor-help transition-colors">
              <Info className="w-4 h-4 text-gray-500 group-hover:text-secondary" />
            </div>
          </div>

          <div className="space-y-2">
            {scores.map((score: any) => (
              <div 
                key={score.domain}
                onClick={() => navigate(`/domain/${score.domain}`)}
                className="group/item cursor-pointer p-2 rounded-2xl hover:bg-white/3 transition-all"
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 rounded-full transition-all group-hover/item:scale-y-110" style={{ backgroundColor: score.color }} />
                    <h6 className="text-white font-semibold text-sm group-hover/item:text-secondary transition-colors">{score.label}</h6>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{score.value}%</span>
                  </div>
                </div>

                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${score.domain === 'friction' ? 100 - score.value : score.value}%`,
                      background: score.color
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium italic opacity-70 group-hover/item:opacity-100 transition-opacity">{score.drift}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Gauge */}
        <Card className="flex flex-col items-center justify-center p-8 bg-white/1">
          <p className="text-sm font-semibold text-gray-400 mb-8">Performance Score</p>

          <div className="relative w-full max-w-64 mx-auto">
            <GaugeComponent
              value={animatedValue}
              minValue={0}
              maxValue={100}
              type="radial"
              arc={{
                width: 0.12,
                padding: 0.02,
                cornerRadius: 1,
                subArcs: [
                  { limit: 40, color: '#EF4444' },
                  { limit: 60, color: '#F5CD19' },
                  { limit: 80, color: '#22C55E' },
                  { limit: 100, color: '#EDDC90' },
                ],
              }}
              pointer={{ type: 'blob', animationDelay: 0, color: '#fff' }}
              labels={{
                valueLabel: {
                  style: { fill: "#ffffff", fontSize: "56px", fontWeight: "bold" },
                },
              }}
            />
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className={`px-4 py-1.5 rounded-xl border font-bold text-xs 
                ${compositeScore < 40 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                compositeScore < 70 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
            >
              {compositeScore < 40 ? "Needs Attention" :
                compositeScore < 70 ? "Stable" : "Peak Performance"}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed px-4">
              Your baseline profile is established. Complete your weekly check-ins to track your progress.
            </p>
          </div>

          <Button variant="outline" className="w-full mt-10 h-10 text-xs font-semibold" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>

      {/* Info Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start">
        <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div>
          <h6 className="text-white font-bold mb-1 text-sm">About your baseline</h6>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your baseline establishes your unique performance signature. Weekly check-ins monitor changes in your cognitive state and energy levels to help you maintain peak performance and avoid burnout.
          </p>
        </div>
      </div>
    </div>
  );
}
