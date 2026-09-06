export function CrateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      role="img"
      aria-label="Caixote de suprimento médico com cruz estenciada"
      className={className}
    >
      {/* Linhas topográficas de fundo */}
      <path
        d="M-10 90 C 60 60, 140 120, 210 84 S 350 60, 430 100"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.45"
        fill="none"
      />
      <path
        d="M-10 160 C 70 130, 150 190, 230 150 S 360 130, 430 170"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.35"
        fill="none"
      />
      <path
        d="M-10 240 C 80 210, 160 265, 240 225 S 370 205, 430 245"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.3"
        fill="none"
      />

      {/* Tampa do caixote */}
      <rect x="70" y="92" width="280" height="34" fill="var(--musgo-500)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Corpo do caixote */}
      <rect x="78" y="126" width="264" height="150" fill="var(--musgo-600)" stroke="var(--musgo-300)" strokeWidth="2" />

      {/* Cintas verticais escuras */}
      <rect x="96" y="92" width="20" height="184" fill="var(--musgo-800)" />
      <rect x="304" y="92" width="20" height="184" fill="var(--musgo-800)" />

      {/* Cruz médica estenciada */}
      <path
        d="M186 156 h28 v24 h24 v28 h-24 v24 h-28 v-24 h-24 v-28 h24 z"
        fill="var(--alerta)"
      />

      {/* Marcação de estêncil — três barras à direita da cruz */}
      <rect x="252" y="164" width="52" height="7" fill="var(--musgo-300)" />
      <rect x="252" y="182" width="38" height="7" fill="var(--musgo-300)" />
      <rect x="252" y="200" width="46" height="7" fill="var(--musgo-300)" />
    </svg>
  );
}
