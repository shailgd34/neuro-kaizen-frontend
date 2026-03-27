export function calculateProgress(answers: Record<string, number>) {

  const answered = Object.keys(answers).length;

  return Math.round((answered / 200) * 100);
}