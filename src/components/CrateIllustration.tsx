export function CrateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      role="img"
      aria-label="Caixote de suprimento médico em perspectiva, estampado a estêncil com cruz e marcações técnicas"
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
        d="M-10 250 C 80 220, 160 275, 240 235 S 370 215, 430 255"
        stroke="var(--musgo-500)"
        strokeWidth="1.5"
        opacity="0.25"
        fill="none"
      />

      {/* Sombra no chão, projetada em perspectiva */}
      <polygon points="70,296 330,296 372,268 112,268" fill="var(--musgo-800)" opacity="0.4" />

      {/* ===== CAIXOTE EM PERSPECTIVA ===== */}

      {/* Face lateral direita */}
      <polygon points="330,150 366,122 366,258 330,286" fill="var(--musgo-700)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Tábuas da lateral */}
      <line x1="330" y1="184" x2="366" y2="156" stroke="var(--musgo-800)" strokeWidth="2" />
      <line x1="330" y1="218" x2="366" y2="190" stroke="var(--musgo-800)" strokeWidth="2" />
      <line x1="330" y1="252" x2="366" y2="224" stroke="var(--musgo-800)" strokeWidth="2" />
      {/* Alça recortada na lateral */}
      <polygon points="340,196 356,184 356,196 340,208" fill="var(--musgo-900)" />

      {/* Face superior (tampa) */}
      <polygon points="90,150 330,150 366,122 126,122" fill="var(--musgo-500)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Sarrafos da tampa */}
      <line x1="150" y1="150" x2="186" y2="122" stroke="var(--musgo-600)" strokeWidth="5" />
      <line x1="270" y1="150" x2="306" y2="122" stroke="var(--musgo-600)" strokeWidth="5" />
      {/* Texto estêncil na tampa, levemente inclinado com a perspectiva */}
      <text
        x="228"
        y="139"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="11"
        fontWeight="600"
        letterSpacing="3"
        fill="var(--musgo-800)"
        transform="skewX(-24)"
      >
        ARSENAL MED
      </text>

      {/* Face frontal */}
      <rect x="90" y="150" width="240" height="136" fill="var(--musgo-600)" stroke="var(--musgo-300)" strokeWidth="2" />
      {/* Juntas horizontais das tábuas */}
      <line x1="90" y1="184" x2="330" y2="184" stroke="var(--musgo-700)" strokeWidth="2" />
      <line x1="90" y1="218" x2="330" y2="218" stroke="var(--musgo-700)" strokeWidth="2" />
      <line x1="90" y1="252" x2="330" y2="252" stroke="var(--musgo-700)" strokeWidth="2" />

      {/* Cintas verticais escuras — sobem pela frontal e dobram na tampa */}
      <polygon points="110,150 126,150 126,286 110,286" fill="var(--musgo-800)" />
      <polygon points="110,150 126,150 162,122 146,122" fill="var(--musgo-800)" />
      <polygon points="288,150 304,150 304,286 288,286" fill="var(--musgo-800)" />
      <polygon points="288,150 304,150 340,122 324,122" fill="var(--musgo-800)" />
      {/* Rebites */}
      <circle cx="118" cy="166" r="2.5" fill="var(--musgo-300)" />
      <circle cx="118" cy="226" r="2.5" fill="var(--musgo-300)" />
      <circle cx="118" cy="272" r="2.5" fill="var(--musgo-300)" />
      <circle cx="296" cy="166" r="2.5" fill="var(--musgo-300)" />
      <circle cx="296" cy="226" r="2.5" fill="var(--musgo-300)" />
      <circle cx="296" cy="272" r="2.5" fill="var(--musgo-300)" />

      {/* Cantoneiras da face frontal */}
      <rect x="90" y="150" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="316" y="150" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="90" y="272" width="14" height="14" fill="var(--musgo-800)" />
      <rect x="316" y="272" width="14" height="14" fill="var(--musgo-800)" />

      {/* Cruz médica estenciada */}
      <path
        d="M162 176 h26 v20 h20 v26 h-20 v20 h-26 v-20 h-20 v-26 h20 z"
        fill="var(--alerta)"
      />
      {/* Falha de estêncil na cruz */}
      <rect x="160" y="202" width="50" height="3" fill="var(--musgo-600)" />

      {/* Bloco de marcações à direita */}
      <text
        x="238"
        y="184"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="10.5"
        fontWeight="600"
        letterSpacing="1.5"
        fill="var(--musgo-100)"
      >
        MATERIAL MÉDICO
      </text>
      <text
        x="238"
        y="201"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="10.5"
        letterSpacing="1.5"
        fill="var(--musgo-300)"
      >
        USO IMEDIATO
      </text>
      {/* Setas "este lado para cima" */}
      <path d="M240 234 v-14 M235 225 l5 -7 5 7" stroke="var(--musgo-100)" strokeWidth="2.5" fill="none" />
      <path d="M256 234 v-14 M251 225 l5 -7 5 7" stroke="var(--musgo-100)" strokeWidth="2.5" fill="none" />
      <text
        x="238"
        y="248"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="8.5"
        letterSpacing="1.5"
        fill="var(--musgo-300)"
      >
        ESTE LADO P/ CIMA
      </text>

      {/* Rodapé estêncil da face frontal */}
      <text
        x="134"
        y="272"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="9.5"
        letterSpacing="2"
        fill="var(--musgo-300)"
      >
        FRÁGIL · Nº 05/33
      </text>

      {/* Tarja de especificação abaixo do caixote */}
      <line x1="90" y1="306" x2="330" y2="306" stroke="var(--musgo-300)" strokeWidth="1" strokeDasharray="5 4" opacity="0.7" />
      <text
        x="210"
        y="324"
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
