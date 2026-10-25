import { useState } from "react";
import { Check, Eye, EyeOff, Minus } from "lucide-react";
import { avaliarSenha, SENHA_MINIMO, SENHA_RECOMENDADO } from "@/lib/senha";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
  /** Mostra a explicação e a lista de conferência (criação ou troca de senha). */
  orientar?: boolean;
};

export function SenhaCampo({ id, label, value, onChange, autoComplete, orientar = false }: Props) {
  const [visivel, setVisivel] = useState(false);
  const av = avaliarSenha(value);
  const dicaId = `${id}-dica`;

  const itens = [
    { ok: av.tamanho, texto: `${SENHA_RECOMENDADO} caracteres ou mais` },
    { ok: av.letrasENumeros, texto: "Letras e números" },
    { ok: av.simbolo, texto: "Um símbolo (! @ # * -)" },
  ];

  return (
    <div>
      <label htmlFor={id} className="label block text-musgo-600">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          required
          minLength={SENHA_MINIMO}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={orientar ? dicaId : undefined}
          className="h-12 w-full rounded-[2px] border-2 border-musgo-300 bg-papel pl-3 pr-24 font-mono text-sm text-tinta outline-none focus-visible:border-ocre"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-pressed={visivel}
          aria-controls={id}
          className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-3 font-heading text-xs font-bold uppercase tracking-[0.1em] text-musgo-600 hover:text-tinta focus-visible:outline-2 focus-visible:outline-ocre"
        >
          {visivel ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {orientar && (
        <div id={dicaId} className="mt-3 border border-musgo-300 bg-musgo-100/40 p-3">
          <p className="text-sm leading-relaxed text-musgo-600">
            Use {SENHA_RECOMENDADO} caracteres ou mais, misturando letras, números e símbolos. Senhas comuns
            (como “12345678” ou “senha123”) ou que já vazaram em outros sites são recusadas automaticamente,
            para proteger seus arquivos.
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-xs" aria-live="polite">
            {itens.map((item) => (
              <li
                key={item.texto}
                className={`flex items-center gap-2 ${item.ok ? "text-tinta" : "text-musgo-600"}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border ${
                    item.ok ? "border-ocre bg-ocre text-musgo-900" : "border-musgo-300"
                  }`}
                  aria-hidden
                >
                  {item.ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <Minus className="h-3 w-3" />}
                </span>
                <span>
                  {item.texto}
                  <span className="sr-only">{item.ok ? " — atendido" : " — pendente"}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-musgo-600">
            Dica: junte três palavras que só você associa, com números e símbolos entre elas. Fica forte e fácil de lembrar.
          </p>
        </div>
      )}
    </div>
  );
}
