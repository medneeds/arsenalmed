export function CrateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      role="img"
      aria-label="Caixote de suprimento médico militar em perspectiva, com tampa clara, cintas e cruz vermelha estenciada"
      className={className}
    >
      {/* Linhas topográficas de fundo */}
      <path d="M-10 84 C 60 56, 140 116, 210 80 S 350 56, 430 96" stroke="var(--musgo-500)" strokeWidth="1.5" opacity="0.35" fill="none" />
      <path d="M-10 156 C 70 126, 150 186, 230 146 S 360 126, 430 166" stroke="var(--musgo-500)" strokeWidth="1.5" opacity="0.28" fill="none" />
      <path d="M-10 250 C 80 220, 160 275, 240 235 S 370 215, 430 255" stroke="var(--musgo-500)" strokeWidth="1.5" opacity="0.22" fill="none" />

      {/* Sombra projetada */}
      <polygon points="66,300 328,300 372,272 110,272" fill="var(--musgo-800)" opacity="0.35" />

      {/* ===== TAMPA (face superior em perspectiva) ===== */}
      <polygon points="88,146 328,146 372,112 132,112" fill="var(--musgo-200)" stroke="var(--musgo-800)" strokeWidth="2" />
      {/* Ressalto frontal da tampa */}
      <rect x="88" y="146" width="240" height="16" fill="var(--musgo-300)" stroke="var(--musgo-800)" strokeWidth="2" />
      {/* Sarrafos da tampa acompanhando a perspectiva */}
      <line x1="148" y1="146" x2="192" y2="112" stroke="var(--musgo-400)" strokeWidth="3" opacity="0.8" />
      <line x1="268" y1="146" x2="312" y2="112" stroke="var(--musgo-400)" strokeWidth="3" opacity="0.8" />
      {/* Brasão + nome estampados na tampa, acompanhando a perspectiva */}
      <g transform="skewX(-22)">
        <g transform="translate(216 109) scale(0.44)">
          <path
            d="M3 3 H36 V26 C36 37 28 44 19.5 47.5 C11 44 3 37 3 26 Z"
            stroke="var(--musgo-700)"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M9 13 L19.5 8.5 L30 13" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
          <path d="M9 19 L19.5 14.5 L30 19" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
          <path
            d="M17 24 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 v-5 h5 z"
            fill="var(--alerta)"
            stroke="var(--alerta)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
        <text
          x="240"
          y="133"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize="10.5"
          fontWeight="600"
          letterSpacing="2.5"
          fill="var(--musgo-700)"
        >
          ARSENAL MED
        </text>
      </g>

      {/* ===== CORPO ===== */}
      {/* Face lateral direita */}
      <polygon points="328,162 372,128 372,258 328,286" fill="var(--musgo-700)" stroke="var(--musgo-800)" strokeWidth="2" />
      <line x1="328" y1="196" x2="372" y2="164" stroke="var(--musgo-800)" strokeWidth="2" opacity="0.6" />
      <line x1="328" y1="240" x2="372" y2="208" stroke="var(--musgo-800)" strokeWidth="2" opacity="0.6" />
      {/* Alça lateral */}
      <polygon points="338,208 358,194 358,206 338,220" fill="var(--musgo-900)" />

      {/* Face frontal */}
      <rect x="88" y="162" width="240" height="124" fill="var(--musgo-600)" stroke="var(--musgo-800)" strokeWidth="2" />

      {/* Cintas horizontais claras (como na referência) */}
      <rect x="88" y="180" width="240" height="9" fill="var(--musgo-300)" opacity="0.9" />
      <rect x="88" y="252" width="240" height="9" fill="var(--musgo-300)" opacity="0.9" />
      <polygon points="328,180 372,148 372,157 328,189" fill="var(--musgo-300)" opacity="0.6" />
      <polygon points="328,252 372,220 372,229 328,261" fill="var(--musgo-300)" opacity="0.6" />

      {/* Base clara */}
      <rect x="88" y="272" width="240" height="14" fill="var(--musgo-200)" stroke="var(--musgo-800)" strokeWidth="2" />
      <polygon points="328,272 372,244 372,258 328,286" fill="var(--musgo-300)" stroke="var(--musgo-800)" strokeWidth="2" />

      {/* Cantoneiras metálicas */}
      <rect x="88" y="162" width="12" height="12" fill="var(--musgo-800)" />
      <rect x="316" y="162" width="12" height="12" fill="var(--musgo-800)" />
      <circle cx="94" cy="168" r="1.8" fill="var(--musgo-300)" />
      <circle cx="322" cy="168" r="1.8" fill="var(--musgo-300)" />

      {/* Travas frontais */}
      <rect x="146" y="152" width="18" height="14" fill="var(--musgo-800)" />
      <rect x="252" y="152" width="18" height="14" fill="var(--musgo-800)" />

      {/* Brasão ARSENAL MED estêncil, centralizado na face frontal */}
      <g transform="translate(208 224) scale(1.55)" opacity="0.95">
        {/* Escudo */}
        <path
          d="M3 3 H36 V26 C36 37 28 44 19.5 47.5 C11 44 3 37 3 26 Z"
          fill="var(--musgo-700)"
          stroke="var(--musgo-100)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Dois galões ocre */}
        <path d="M9 13 L19.5 8.5 L30 13" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        <path d="M9 19 L19.5 14.5 L30 19" stroke="var(--ocre)" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        {/* Cruz médica no centro do escudo */}
        <path
          d="M17 24 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 v-5 h5 z"
          fill="var(--alerta)"
          stroke="var(--alerta)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      {/* Falha de estêncil */}
      <rect x="180" y="230" width="56" height="2.5" fill="var(--musgo-600)" opacity="0.7" />

      {/* Marcações laterais na face frontal */}
      <text x="100" y="206" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="600" letterSpacing="1.4" fill="var(--musgo-100)">
        MATERIAL
      </text>
      <text x="100" y="220" fontFamily="'IBM Plex Mono', monospace" fontSize="9" letterSpacing="1.4" fill="var(--musgo-200)">
        MÉDICO
      </text>
      <path d="M104 248 v-13 M99.5 239.5 l4.5 -6 4.5 6" stroke="var(--musgo-200)" strokeWidth="2.2" fill="none" />
      <text x="272" y="206" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="600" letterSpacing="1.4" fill="var(--musgo-100)">
        USO
      </text>
      <text x="272" y="220" fontFamily="'IBM Plex Mono', monospace" fontSize="9" letterSpacing="1.4" fill="var(--musgo-200)">
        IMEDIATO
      </text>
      <text x="272" y="244" fontFamily="'IBM Plex Mono', monospace" fontSize="8" letterSpacing="1.4" fill="var(--musgo-300)">
        Nº 05/33
      </text>

      {/* Tarja de especificação abaixo do caixote */}
      <line x1="88" y1="308" x2="328" y2="308" stroke="var(--musgo-300)" strokeWidth="1" strokeDasharray="5 4" opacity="0.7" />
      <text x="208" y="326" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="10" letterSpacing="3" fill="var(--musgo-500)">
        33 CENÁRIOS · 2 VOLUMES
      </text>
    </svg>
  );
}
