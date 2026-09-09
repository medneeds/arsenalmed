/**
 * Carimbo circular de manual técnico — mesmo desenho das artes de story.
 * Decorativo: o texto já existe em contexto na própria seção.
 */
export function Stamp({
  top,
  main,
  bottom,
  className = "",
}: {
  top?: string;
  main: string;
  bottom?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex aspect-square w-[112px] -rotate-[8deg] select-none flex-col items-center justify-center rounded-full border-[5px] border-alerta/90 text-alerta md:w-[136px] ${className}`}
      style={{ boxShadow: "inset 0 0 0 2px color-mix(in oklab, var(--alerta) 40%, transparent)" }}
    >
      {top ? (
        <span className="max-w-full truncate px-2 font-heading text-[8px] font-bold uppercase leading-none tracking-[0.08em] md:text-[10px]">
          {top}
        </span>
      ) : null}
      <span className="my-1 block h-[2px] w-[36px] bg-alerta md:w-[46px]" />
      <span className="px-2 text-center font-heading text-[13px] font-bold uppercase leading-[1.05] tracking-[0.03em] md:text-[16px]">
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
