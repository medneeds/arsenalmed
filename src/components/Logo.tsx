type LogoProps = {
  /** Altura do brasão em px. */
  size?: number;
  /** Versão para fundos escuros (musgo-800): traço claro, galões ocre. */
  variant?: "papel" | "musgo";
  className?: string;
};

export function Logo({ size = 36, variant = "papel", className }: LogoProps) {
  const stroke = variant === "musgo" ? "var(--musgo-300)" : "var(--musgo-500)";
  const word = variant === "musgo" ? "var(--papel)" : "var(--musgo-900)";
  const sub = variant === "musgo" ? "var(--musgo-300)" : "var(--musgo-500)";

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: size * 0.34 }}>
      <svg
        width={size * 0.78}
        height={size}
        viewBox="0 0 39 50"
        fill="none"
        role="img"
        aria-label="Brasão Arsenal Med"
      >
        {/* Escudo */}
        <path
          d="M3 3 H36 V26 C36 37 28 44 19.5 47.5 C11 44 3 37 3 26 Z"
          stroke={stroke}
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Dois galões em ocre, empilhados no topo */}
        <path d="M9 13 L19.5 8.5 L30 13" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        <path d="M9 19 L19.5 14.5 L30 19" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        {/* Cruz médica sólida */}
        <path
          d="M17 24 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 v-5 h5 z"
          fill="var(--musgo-100)"
          stroke="var(--musgo-100)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: size * 0.5,
            letterSpacing: "0.14em",
            color: word,
          }}
        >
          ARSENAL
        </span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: size * 0.26,
            letterSpacing: "0.5em",
            color: sub,
            marginTop: size * 0.08,
          }}
        >
          MED
        </span>
      </span>
    </span>
  );
}
