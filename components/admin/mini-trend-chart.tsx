// Petit graphe d'évolution (SVG statique, rendu côté serveur — pas d'interactivité).
// Prend une série de points mensuels { label, value } et trace une ligne.
export function MiniTrendChart({
  points,
  className,
}: {
  points: { label: string; value: number }[];
  className?: string;
}) {
  const w = 640;
  const h = 200;
  const padX = 8;
  const padY = 16;
  const max = Math.max(1, ...points.map((p) => p.value));
  const stepX = points.length > 1 ? (w - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = h - padY - (p.value / max) * (h - padY * 2);
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x.toFixed(1) ?? 0} ${h - padY} L ${
    coords[0]?.x.toFixed(1) ?? 0
  } ${h - padY} Z`;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
        <path d={area} fill="var(--color-hz-blue)" opacity="0.08" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-hz-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill="var(--color-hz-blue)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-hz-ink/50">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
