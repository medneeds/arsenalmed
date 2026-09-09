export function CrateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      role="img"
      aria-label="Caixote de suprimento médico estampado a estêncil com cruz e marcações técnicas"
      className={className}
    >
      {/* Linhas topográficas de fundo */}
      <path
        d="M-10 90 C 60 60, 140 120, 210 84 S 350 60, 430 100"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M-10 160 C 70 130, 150 190, 230 150 S 360 130, 430 170"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M-10 240 C 80 210, 160 265, 240 225 S 370 205, 430 245"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.25"
        fill="none"
      />

      {/* Sombra de impressão deslocada */}
      <rect x="80" y="100" width="280" height="186" fill="var(--musgo-800)" opacity="0.35" />

      {/* Tampa do caixote */}
      <rect x="70" y="92" width="280" height="34" fill="var(--musgo-500)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Sarrafos diagonais da tampa */}
      <line x1="120" y1="92" x2="150" y2="126" stroke="var(--musgo-600)" strokeWidth="4" />
      <line x1="270" y1="126" x2="300" y2="92" stroke="var(--musgo-600)" strokeWidth="4" />

      {/* Corpo do caixote */}
      <rect x="78" y="126" width="264" height="152" fill="var(--musgo-600)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Juntas horizontais das tábuas */}
      <line x1="78" y1="164" x2="342" y2="164" stroke="var(--musgo-700)" strokeWidth="2" />
      <line x1="78" y1="202" x2="342" y2="202" stroke="var(--musgo-700)" strokeWidth="2" />
      <line x1="78" y1="240" x2="342" y2="240" stroke="var(--musgo-700)" strokeWidth="2" />

      {/* Cintas verticais escuras */}
      <rect x="96" y="92" width="20" height="186" fill="var(--musgo-800)" />
      <rect x="304" y="92" width="20" height="186" fill="var(--musgo-800)" />
      {/* Rebites das cintas */}
      <circle cx="106" cy="108" r="2.5" fill="var(--musgo-300)" />
      <circle cx="106" cy="184" r="2.5" fill="var(--musgo-300)" />
      <circle cx="106" cy="260" r="2.5" fill="var(--musgo-300)" />
      <circle cx="314" cy="108" r="2.5" fill="var(--musgo-300)" />
      <circle cx="314" cy="184" r="2.5" fill="var(--musgo-300)" />
      <circle cx="314" cy="260" r="2.5" fill="var(--musgo-300)" />

      {/* Cantoneiras */}
      <rect x="78" y="126" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="328" y="126" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="78" y="264" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="328" y="264" width="14" height="14" fill="var(--musgo-800)" />

      {/* Travas da tampa */}
      <rect x="182" y="118" width="22" height="14" fill="var(--musgo-300)" stroke="var(--musgo-800)" strokeWidth="1.5" />
      <rect x="218" y="118" width="22" height="14" fill="var(--musgo-300)" stroke="var(--musgo-800)" strokeWidth="1.5" />

      {/* Marcação estêncil superior */}
      <text
        x="210"
        y="110"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="13"
        fontWeight="600"
        letterSpacing="4"
        fill="var(--musgo-100)"
      >
        ARSENAL MED
      </text>

      {/* Cruz médica estenciada */}
      <path
        d="M172 156 h30 v22 h22 v30 h-22 v22 h-30 v-22 h-22 v-30 h22 z"
        fill="var(--alerta)"
      />
      {/* Falha de estêncil na cruz */}
      <rect x="170" y="184" width="56" height="3" fill="var(--musgo-600)" />

      {/* Bloco de marcações à direita */}
      <text
        x="252"
        y="164"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="11"
        fontWeight="600"
        letterSpacing="2"
        fill="var(--musgo-100)"
      >
        MATERIAL MÉDICO
      </text>
      <text
        x="252"
        y="182"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="11"
        letterSpacing="2"
        fill="var(--musgo-300)"
      >
        USO IMEDIATO
      </text>
      {/* Setas "este lado para cima" */}
      <path d="M254 214 v-14 M249 205 l5 -7 5 7" stroke="var(--musgo-100)" strokeWidth="2.5" fill="none" />
      <path d="M270 214 v-14 M265 205 l5 -7 5 7" stroke="var(--musgo-100)" strokeWidth="2.5" fill="none" />
      <text
        x="252"
        y="230"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="9"
        letterSpacing="1.5"
        fill="var(--musgo-300)"
      >
        ESTE LADO P/ CIMA
      </text>

      {/* Rodapé estêncil do caixote */}
      <text
        x="132"
        y="266"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="10"
        letterSpacing="2"
        fill="var(--musgo-300)"
      >
        FRÁGIL · Nº 05/33
      </text>

      {/* Tarja de especificação abaixo do caixote */}
      <line x1="78" y1="300" x2="342" y2="300" stroke="var(--musgo-300)" strokeWidth="1" strokeDasharray="5 4" opacity="0.7" />
      <text
        x="210"
        y="318"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="10"
        letterSpacing="3"
        fill="var(--musgo-500)"
      >
        33 CENÁRIOS · 2 VOLUMES
      </text>
    </svg>
  );
}
