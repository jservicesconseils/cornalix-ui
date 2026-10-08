// cornalix-ms-scoring/-reporting renvoient des fractions (0.0 a 1.0,
// null si aucune reponse exploitable) ; tout l'affichage cote frontend
// (radar, barres, anneau de score) travaille en pourcentage 0-100.
// Point de conversion unique partage par ScoringApiService et
// ReportingApiService.
export function toPercent(fraction: number | null): number | null {
  return fraction === null ? null : Math.round(fraction * 100);
}

export function mapFractionsToPercent<T extends Record<string, number>>(fractions: T): T {
  return Object.fromEntries(
    Object.entries(fractions).map(([key, value]) => [key, Math.round(value * 100)]),
  ) as T;
}
