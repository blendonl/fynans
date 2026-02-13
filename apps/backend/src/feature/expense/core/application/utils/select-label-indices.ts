/**
 * Returns a set of indices that should display axis labels,
 * evenly distributed across the data points.
 */
export function selectLabelIndices(
  totalPoints: number,
  maxLabels: number,
): Set<number> {
  if (totalPoints <= 0) return new Set();
  if (totalPoints <= maxLabels) {
    return new Set(Array.from({ length: totalPoints }, (_, i) => i));
  }
  if (maxLabels === 1) return new Set([0]);

  const indices = new Set<number>();
  for (let i = 0; i < maxLabels; i++) {
    indices.add(Math.round((i * (totalPoints - 1)) / (maxLabels - 1)));
  }
  return indices;
}
