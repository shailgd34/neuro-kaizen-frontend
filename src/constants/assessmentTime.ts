const START_KEY = "baseline_assessment_start_time";

/**
 * Get or create assessment start time
 */
export function getAssessmentStartTime(): number {
  const saved = localStorage.getItem(START_KEY);

  if (saved) return Number(saved);

  const now = Date.now();
  localStorage.setItem(START_KEY, String(now));

  return now;
}

/**
 * Clear start time when assessment finishes
 */
export function clearAssessmentStartTime() {
  localStorage.removeItem(START_KEY);
}

/**
 * Calculate estimated remaining minutes
 */
export function getEstimatedRemainingMinutes(
  completed: number,
  total: number,
  startTime: number
): number {

  const elapsedMinutes = (Date.now() - startTime) / 60000;

  const avgPerQuestion =
    completed > 0 ? elapsedMinutes / completed : 0.15; // fallback

  const remainingQuestions = total - completed;

  const estimatedMinutes = Math.max(
    1,
    Math.ceil(remainingQuestions * avgPerQuestion)
  );

  return estimatedMinutes;
}