import { useNavigate } from "react-router-dom";
import { ChevronRight, Target, Clock } from "lucide-react";
import Button from "../../ui/Button";
import { useState, useEffect } from "react";

type Props = {
  weeksSubmitted?: number;
  totalWeeks?: number;
  isBaselineSubmitted?: boolean;
  isLocked?: boolean;
  isWeekSubmitted?: boolean;
  remainingTime?: number; // in seconds
  phase2Required?: boolean;
  phase2Completed?: boolean;
  phase2ScorePassed?: boolean; // true if Phase 2 score >= 60
  targetDomain?: string;
  onRefresh?: () => void;
};

export default function CalibrationBanner({
  weeksSubmitted = 0,
  totalWeeks = 6,
  isBaselineSubmitted = false,
  isLocked = false,
  isWeekSubmitted = false,
  remainingTime: initialRemainingTime = 0,
  phase2Required = false,
  phase2Completed = false,
  phase2ScorePassed = false,
  targetDomain,
  onRefresh,
}: Props) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(initialRemainingTime);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    setTimeLeft(initialRemainingTime);
    setHasRefreshed(false);
  }, [initialRemainingTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (initialRemainingTime > 0 && onRefresh && !hasRefreshed) {
        setHasRefreshed(true);
        onRefresh();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onRefresh, initialRemainingTime, hasRefreshed]);

  if (!isBaselineSubmitted) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  let currentLabel = "";
  let subLabel = "";
  let badgeText = "Calibration Phase";
  let isPinging = false;
  let showTimer = false;

  const isPhase2Action = phase2Required && !phase2Completed;

  if (isPhase2Action) {
    if (phase2ScorePassed) {
      // Passed Phase 2 but still flagged — shouldn't happen, but safe fallback
      currentLabel = "Phase 2 Complete — Week Unlocking";
      subLabel = "Your diagnostic score cleared the threshold. Next check-in is being prepared.";
      badgeText = "Phase 2 Passed";
    } else {
      currentLabel = "Deep Diagnostic Required — Phase 2 Active";
      subLabel = "Score ≥ 60 required to unlock the next check-in week. If you don't pass, a new subscale will be assigned.";
      badgeText = "Protocol Gate Active";
      isPinging = true;
    }
    showTimer = false;
  } else if (isLocked) {
    currentLabel = `Next check-in unlocking in ${formatTime(timeLeft)}`;
    subLabel = "Sit tight — your next calibration window opens soon.";
    badgeText = "Cooling Period";
    showTimer = true;
  } else if (isWeekSubmitted) {
    currentLabel = `Week ${weeksSubmitted} check-in complete`;
    subLabel = "Results are being processed. Your next session will open shortly.";
    badgeText = "Protocol Active";
  } else {
    currentLabel = `Week ${weeksSubmitted} check-in available`;
    subLabel = "Complete your weekly assessment to keep your calibration on track.";
    badgeText = "Action Required";
    isPinging = true;
  }

  // Progress reflects the last FULLY COMPLETE week
  const completedWeeks = weeksSubmitted - (isWeekSubmitted || isLocked ? 0 : 1);
  const progressPercent = Math.min(100, Math.max(0, Math.round((completedWeeks / totalWeeks) * 100)));

  return (
    <div className="mb-10 animate-in slide-in-from-top-4 duration-1000">
      <div className="group relative rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden bg-[#0A0D11] border border-secondary/20 shadow-2xl shadow-secondary/10 hover:shadow-secondary/20 transition-all duration-500">

        {/* Animated Background Gradients */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full mix-blend-screen opacity-50 group-hover:opacity-80 transition-opacity duration-1000 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full mix-blend-screen opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

        {/* Animated sweeping edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-secondary to-transparent opacity-50" />
        <div className="absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-secondary to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 w-full">
          {/* Icon */}
          <div className="relative flex shrink-0">
            <div className="absolute inset-0 bg-secondary blur-xl opacity-30 animate-pulse rounded-full" />
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-[#1A1F26] to-[#0A0D11] border border-secondary/30 relative z-10 shadow-inner">
              {showTimer ? (
                <Clock size={24} className="text-secondary drop-shadow-[0_0_8px_rgba(237,220,144,0.8)]" />
              ) : (
                <Target size={24} className="text-secondary drop-shadow-[0_0_8px_rgba(237,220,144,0.8)]" />
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
                <div className={`w-1.5 h-1.5 bg-secondary rounded-full ${isPinging ? 'animate-ping' : ''}`} />
                {badgeText}
              </span>
            </div>

            <h4 className="text-white font-bold text-xl md:text-2xl tracking-tight mb-1">
              {currentLabel}
            </h4>
            {subLabel && (
              <p className="text-gray-400 text-sm leading-relaxed mb-3 max-w-md">{subLabel}</p>
            )}

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-50 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 to-secondary transition-all duration-1000 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white opacity-40 mix-blend-overlay" />
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-bold tracking-tight">Week {completedWeeks} / {totalWeeks}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 w-full md:w-auto shrink-0 md:pl-6 md:border-l border-white/10">
          <Button
            variant="goldDark"
            disabled={isLocked && !isPhase2Action}
            onClick={() => {
              if (isPhase2Action) navigate("/phase2", { state: { domain: targetDomain } });
              else navigate(isWeekSubmitted ? "/weekly/result" : "/weekly");
            }}
            className={`w-full md:w-auto h-12 px-8 text-sm font-bold shadow-[0_0_20px_rgba(237,220,144,0.15)] hover:shadow-[0_0_30px_rgba(237,220,144,0.25)] flex items-center justify-center gap-2 group/btn ${isPhase2Action ? 'bg-rose-600 hover:bg-rose-500 hover:text-white' : ''}`}
          >
            {isPhase2Action ? "Start Phase 2" : isLocked ? "Locked" : isWeekSubmitted ? "Insights" : "Start Check-in"} <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </div>
  );
}