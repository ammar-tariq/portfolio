type Point = { city: string; country?: string; lat?: number; lng?: number; count: number };

const RINGS: [number, number][][] = [
  [
    [-168, 71],
    [-141, 70],
    [-141, 60],
    [-130, 55],
    [-125, 49],
    [-95, 49],
    [-84, 46],
    [-67, 47],
    [-66, 44],
    [-80, 31],
    [-97, 26],
    [-97, 18],
    [-110, 23],
    [-117, 32],
    [-125, 38],
    [-124, 48],
    [-153, 59],
    [-166, 64],
    [-168, 71],
  ],
  [
    [-73, 77],
    [-20, 81],
    [-22, 70],
    [-44, 60],
    [-73, 77],
  ],
  [
    [-81, 12],
    [-60, 8],
    [-50, 0],
    [-35, -7],
    [-35, -23],
    [-55, -35],
    [-68, -55],
    [-75, -45],
    [-81, -5],
    [-81, 12],
  ],
  [
    [-10, 36],
    [-9, 43],
    [-5, 48],
    [-5, 58],
    [5, 59],
    [12, 55],
    [24, 60],
    [30, 70],
    [32, 60],
    [29, 45],
    [18, 40],
    [12, 36],
    [-10, 36],
  ],
  [
    [-10, 51],
    [-1, 51],
    [-2, 58],
    [-6, 58],
    [-10, 51],
  ],
  [
    [-17, 32],
    [-5, 36],
    [10, 37],
    [32, 31],
    [43, 11],
    [51, 11],
    [40, -15],
    [32, -25],
    [20, -35],
    [18, -34],
    [12, -17],
    [8, 5],
    [-15, 10],
    [-17, 32],
  ],
  [
    [43, -12],
    [50, -13],
    [47, -25],
    [43, -25],
    [43, -12],
  ],
  [
    [32, 60],
    [40, 70],
    [90, 75],
    [140, 71],
    [160, 65],
    [180, 62],
    [180, 10],
    [145, 12],
    [100, 6],
    [77, 8],
    [68, 24],
    [60, 25],
    [45, 40],
    [32, 45],
    [32, 60],
  ],
  [
    [114, -22],
    [114, -35],
    [135, -38],
    [153, -28],
    [153, -12],
    [142, -11],
    [126, -14],
    [114, -22],
  ],
  [
    [167, -34],
    [178, -37],
    [177, -47],
    [166, -46],
    [167, -34],
  ],
  [
    [-180, -72],
    [0, -70],
    [180, -72],
    [180, -85],
    [-180, -85],
    [-180, -72],
  ],
];

function ringPath(ring: [number, number][]) {
  return `${ring.map(([lng, lat], index) => `${index ? "L" : "M"}${lng + 180} ${90 - lat}`).join(" ")} Z`;
}

export function VisitorMap({ points }: { points: Point[] }) {
  const dots = points.filter((point) => typeof point.lat === "number" && typeof point.lng === "number");
  const max = Math.max(1, ...dots.map((point) => point.count));
  return (
    <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-3xl border border-line bg-bg-soft">
      <svg viewBox="0 0 360 180" className="h-full w-full" role="img" aria-label="Visitor map">
        <rect width="360" height="180" className="fill-bg" />
        {RINGS.map((ring, index) => (
          <path key={index} d={ringPath(ring)} className="fill-accent/20 stroke-accent/35" strokeWidth="0.4" />
        ))}
        {dots.map((point) => {
          const radius = 1.4 + (point.count / max) * 2.2;
          return (
            <circle
              key={`${point.city}-${point.lat}-${point.lng}`}
              cx={(point.lng ?? 0) + 180}
              cy={90 - (point.lat ?? 0)}
              r={radius}
              className="fill-accent"
            >
              <title>{`${point.city || point.country || "Unknown"} (${point.count})`}</title>
            </circle>
          );
        })}
      </svg>
      {dots.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
          No public-IP city dots yet. Localhost and Docker IPs cannot be placed on the map.
        </p>
      ) : null}
    </div>
  );
}
