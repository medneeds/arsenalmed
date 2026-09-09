/**
 * Carimbo circular de manual técnico — mesmo desenho das artes de story.
 * Decorativo: o texto já existe em contexto na própria seção.
 */
export function Stamp({
  top,
  main,
  bottom,
  className = "",
  tone = "claro",
}: {
  top?: string;
  main: string;
  bottom?: string;
  className?: string;
  tone?: "claro" | "escuro";
}) {
  const cor = tone === "escuro" ? "text-alerta-claro" : "text-alerta";
  const borda = tone === "escuro" ? "border-alerta-claro/80" : "border-alerta/90";
  const barra = tone === "escuro" ? "bg-alerta-claro" : "bg-alerta";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex aspect-square w-[112px] -rotate-[8deg] select-none flex-col items-center justify-center rounded-full border-[4px] ${borda} ${cor} md:w-[132px] ${className}`}
      style={{
        boxShadow: `inset 0 0 0 2px color-mix(in oklab, var(--${tone === "escuro" ? "alerta-claro" : "alerta"}) 40%, transparent)`,
      }}
    >
      {top ? (
        <span className="max-w-full truncate px-2 font-heading text-[8px] font-bold uppercase leading-none tracking-[0.08em] md:text-[10px]">
          {top}
        </span>
      ) : null}
      <span className={`my-1 block h-[2px] w-[34px] ${barra} md:w-[44px]`} />
      <span className="px-2 text-center font-heading text-[12px] font-bold uppercase leading-[1.05] tracking-[0.02em] md:text-[14px]">
        {main}
      </span>
      {bottom ? (
        <span className="mt-1 max-w-full truncate px-2 font-heading text-[8px] font-bold uppercase leading-none tracking-[0.08em] md:text-[10px]">
          {bottom}
        </span>
      ) : null}
    </div>
  );
}
