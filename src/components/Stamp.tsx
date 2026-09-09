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
        <span className="font-heading text-[10px] font-bold uppercase leading-none tracking-[0.1em] md:text-[12px]">
          {top}
        </span>
      ) : null}
      <span className="my-1.5 block h-[3px] w-[44px] bg-alerta md:w-[54px]" />
      <span className="px-2 text-center font-heading text-[14px] font-bold uppercase leading-[1.05] tracking-[0.04em] md:text-[17px]">
        {main}
      </span>
      {bottom ? (
        <span className="mt-1 font-heading text-[10px] font-bold uppercase leading-none tracking-[0.1em] md:text-[12px]">
          {bottom}
        </span>
      ) : null}
    </div>
  );
}
