type Tone = "escuro" | "claro";

/**
 * Linhas topográficas de fundo — mesma malha usada nas artes de story.
 * Puramente decorativa.
 */
export function TopoLines({
  tone = "claro",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const stroke = tone === "escuro" ? "var(--musgo-600)" : "var(--musgo-500)";
  const base = tone === "escuro" ? 0.55 : 0.4;

  return (
    <svg
      viewBox="0 0 1080 720"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {[
        { d: "M-40 90 C 160 30, 360 160, 540 84 S 860 20, 1120 110", o: 1 },
        { d: "M-40 220 C 180 150, 380 290, 580 200 S 900 140, 1120 240", o: 0.85 },
        { d: "M-40 370 C 200 290, 420 450, 620 350 S 940 290, 1120 390", o: 0.7 },
        { d: "M-40 520 C 220 430, 460 600, 660 490 S 960 430, 1120 540", o: 0.55 },
        { d: "M-40 660 C 220 580, 460 720, 660 640 S 960 600, 1120 680", o: 0.45 },
      ].map((p) => (
        <path
          key={p.d}
          d={p.d}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          opacity={base * p.o}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
