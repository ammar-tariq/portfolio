export function VisitorMap({
  points,
}: {
  points: { city: string; lat?: number; lng?: number; count: number }[];
}) {
  const dots = points.filter((point) => typeof point.lat === "number" && typeof point.lng === "number");
  return (
    <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-3xl border border-line bg-bg-soft">
      <div className="hero-grid absolute inset-0 opacity-50" />
      {dots.length === 0 ? (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
          No city dots yet. Local development traffic has no public IP, so nothing can be placed on the map.
        </p>
      ) : (
        dots.map((point) => (
          <span
            key={`${point.city}-${point.lat}-${point.lng}`}
            title={`${point.city} (${point.count})`}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
            style={{
              left: `${(((point.lng ?? 0) + 180) / 360) * 100}%`,
              top: `${((90 - (point.lat ?? 0)) / 180) * 100}%`,
            }}
          />
        ))
      )}
    </div>
  );
}
