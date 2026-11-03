import { useRef, useState } from "react";
import { track } from "@/lib/analytics";

// VSL do site (16:9). Carrega só o pôster até o play — não pesa no primeiro carregamento.
const SRC = "/vsl/arsenal-med-vsl.mp4";
const POSTER = "/vsl/arsenal-med-vsl-poster.jpg";
const MARCOS = [25, 50, 75, 95];

export function Vsl() {
  const ref = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const vistos = useRef(new Set<number>());

  function play() {
    const v = ref.current;
    if (!v) return;
    setTocando(true);
    v.controls = true;
    void v.play();
    track("vsl_play");
  }

  function progresso() {
    const v = ref.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    for (const m of MARCOS) {
      if (pct >= m && !vistos.current.has(m)) {
        vistos.current.add(m);
        track("vsl_progress", { pct: m });
      }
    }
  }

  return (
    <section id="video" className="bg-musgo-900 px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="label text-center text-ocre">VÍDEO · 2 MIN 34 S</p>
        <h2 className="mx-auto mt-4 max-w-[34ch] text-center text-[22px] leading-[1.25] text-papel md:text-[30px]">
          Por que o Arsenal começa pelo cenário — explicado por quem escreveu
        </h2>
        <div className="relative mt-8 aspect-video w-full overflow-hidden border border-musgo-600 bg-black">
          <video
            ref={ref}
            className="h-full w-full"
            src={SRC}
            poster={POSTER}
            preload="none"
            playsInline
            onTimeUpdate={progresso}
            onPlay={() => setTocando(true)}
          />
          {!tocando && (
            <button
              type="button"
              onClick={play}
              aria-label="Assistir ao vídeo do Arsenal Med"
              className="group absolute inset-0 flex items-center justify-center bg-musgo-900/25 transition-colors hover:bg-musgo-900/10"
            >
              <span className="flex h-20 w-20 items-center justify-center bg-ocre shadow-lg transition-transform group-hover:scale-105 md:h-24 md:w-24">
                <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 fill-musgo-900 md:h-11 md:w-11" aria-hidden="true">
                  <path d="M7 4.5v15l12-7.5z" />
                </svg>
              </span>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-musgo-900/90 px-3 py-1.5 font-heading text-[10px] md:bottom-4 font-bold uppercase tracking-[0.14em] text-papel md:text-xs">
                Toque para assistir com som
              </span>
            </button>
          )}
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#preco"
            onClick={() => track("explore_product", { origem: "vsl" })}
            className="flex min-h-12 w-full items-center justify-center bg-ocre px-6 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-papel sm:w-auto"
          >
            GARANTIR MEU ARSENAL
          </a>
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-musgo-300 md:text-xs">
            Pagamento único · 7 dias de garantia
          </p>
        </div>
      </div>
    </section>
  );
}
