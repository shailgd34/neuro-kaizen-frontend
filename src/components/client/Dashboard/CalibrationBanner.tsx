type Props = {
  weeksSubmitted?: number;
  isBaselineSubmitted?: boolean;
};

export default function CalibrationBanner({
  weeksSubmitted = 0,
  isBaselineSubmitted,
}: Props) {
  const totalWeeks = 6;
  const currentWeek = weeksSubmitted;

  // ❌ Do not show before baseline is submitted
  if (!isBaselineSubmitted) return null;

  // ❌ Hide after calibration phase ends
  if (currentWeek > totalWeeks) return null;

  const isLastWeek = currentWeek === totalWeeks;

  return (
    <div className="bg-gold-gradient text-black px-6 py-4 rounded-sm mb-6">
      
      {/* Title */}
      <div className="font-semibold">
        Calibration Phase Active
      </div>

      {/* Week Info */}
      <h6 className="font-medium">
        Week {currentWeek} of {totalWeeks}
      </h6>

      {/* Description */}
      <div className="text-sm mt-1">
        {isLastWeek
          ? "Final calibration week. Drift signals will activate next."
          : "Drift signals activate after calibration window completes."}
      </div>

    </div>
  );
}