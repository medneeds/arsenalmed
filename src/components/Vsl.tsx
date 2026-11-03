import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

// VSL do site (16:9), no topo da página. Começa sem som (os navegadores só
// permitem autoplay mudo) e mostra um chamado grande para tocar e ouvir; ao
// tocar, o vídeo volta ao início com som e controles.
const SRC = "/vsl/arsenal-med-vsl.mp4";
const POSTER = "/vsl/arsenal-med-vsl-poster.jpg";
const MARCOS = [25, 50, 75, 95];

type Estado = "parado" | "mudo" | "com-som";

export function Vsl() {
  const ref = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<Estado>("parado");
  const vistos = useRef(new Set<number>());

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) return;
    v.muted = true;
    v.play()
      .then(() => setEstado((e) => (e === "parado" ? "mudo" : e)))
      .catch(() => setEstado("parado"));
  }, []);

  function ouvir() {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.controls = true;
    setEstado("com-som");
    void v.play();
    vistos.current.clear();
    track("vsl_play", { modo: estado === "mudo" ? "ativou_som" : "play" });
  }

  function progresso() {
    const v = ref.current;
    if (!v || !v.duration || estado !== "com-som") return;
    const pct = (v.currentTime / v.duration) * 100;
    for (const m of MARCOS) {
      if (pct >= m && !vistos.current.has(m)) {
        vistos.current.add(m);
        track("vsl_progress", { pct: m });
      }
    }
  }

  return (
    <div id="video" className="relative aspect-video w-full overflow-hidden border-2 border-ocre bg-musgo-900 shadow-[0_18px_50px_-20px_rgba(27,36,24,0.55)]">
      <video
        ref={ref}
        className="h-full w-full"
        src={SRC}
        poster={POSTER}
        preload="metadata"
        playsInline
        muted
        onTimeUpdate={progresso}
        onEnded={() => track("vsl_progress", { pct: 100 })}
      />
      {estado !== "com-som" && (
        <button
          type="button"
          onClick={ouvir}
          aria-label="Assistir ao vídeo do Arsenal Med com som"
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-musgo-900/35 transition-colors hover:bg-musgo-900/20"
        >
          <span className="relative flex h-20 w-20 items-center justify-center md:h-28 md:w-28">
            <span className="absolute inset-0 animate-ping bg-ocre/60 motion-reduce:hidden" aria-hidden="true" />
            <span className="relative flex h-full w-full items-center justify-center bg-ocre shadow-lg transition-transform group-hover:scale-105">
              {estado === "mudo" ? (
                <svg viewBox="0 0 24 24" className="h-10 w-10 fill-musgo-900 md:h-14 md:w-14" aria-hidden="true">
                  <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-1 h-10 w-10 fill-musgo-900 md:h-14 md:w-14" aria-hidden="true">
                  <path d="M7 4.5v15l12-7.5z" />
                </svg>
              )}
            </span>
          </span>
          <span className="bg-musgo-900/90 px-3 py-2 text-center font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-papel md:px-4 md:text-sm">
            {estado === "mudo" ? "O vídeo já começou · toque para ouvir" : "Assista · 2 min 34 s"}
          </span>
        </button>
      )}
    </div>
  );
}
