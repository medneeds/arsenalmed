import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { registrarLead, CONSENT_TEXT } from "@/utils/leads.functions";
import { track } from "@/lib/analytics";

const PERFIS = ["Estudante de medicina", "Interno", "Residente", "Médico(a)", "Outro"];

const inputClass =
  "mt-2 w-full border border-musgo-300 bg-papel px-3 py-2.5 font-body text-[16px] text-tinta outline-none transition-colors placeholder:text-musgo-500 focus:border-musgo-700";
const labelClass = "font-heading text-xs font-bold uppercase tracking-[0.14em] text-musgo-700";

export function LeadCaptureModal({
  children,
  origem = "landing",
}: {
  children: ReactNode;
  origem?: string;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const res = await registrarLead({
        data: { nome: nome.trim(), email: email.trim(), perfil, consentimento: true },
      });
      if (res.ok) {
        setUrl(res.url);
        setEnviado(true);
        track("submit_compacto", { origem });
      }
      else setErro(res.error);
    } catch {
      setErro("Não conseguimos registrar seu e-mail agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) track("open_compacto", { origem });
        if (!next && enviado) {
          setEnviado(false);
          setUrl(null);
          setNome("");
          setEmail("");
          setPerfil("");
          setConsentimento(false);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border border-musgo-300 bg-papel-2 p-6 sm:max-w-[440px]">
        {enviado ? (
          <div>
            <p className="label text-musgo-500">ARSENAL COMPACTO</p>
            <h3 className="mt-4 text-tinta">Enviado</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-tinta">
              Confira sua caixa de entrada — e o spam, se não chegar em dois minutos.
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex min-h-12 w-full items-center justify-center bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                BAIXAR AGORA
              </a>
            )}
            <div className="mt-6 border-t border-musgo-300 pt-5">
              <p className="text-[15px] leading-relaxed text-musgo-700">
                O Compacto traz 5 dos 33 cenários. A edição completa entrega os 2 volumes — Manual Completo e
                Catálogo de Fármacos e Tabelas em bônus.
              </p>
              <a
                href="/comprar"
                onClick={() => track("click_buy", { origem: "compacto_modal" })}
                className="mt-4 flex min-h-12 w-full items-center justify-center border border-musgo-600 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                VER A EDIÇÃO COMPLETA — {ARSENAL_PRICE}
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="label text-musgo-500">GRATUITO · SEM CARTÃO</p>
            <h3 className="mt-4 text-tinta">RECEBER O ARSENAL COMPACTO</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-musgo-700">
              Dois campos e o PDF chega no seu e-mail. 5 cenários na íntegra + as 11 armadilhas.
            </p>


            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClass} htmlFor="lead-nome">
                  Nome
                </label>
                <input
                  id="lead-nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="lead-email">
                  E-mail
                </label>
                <input
                  id="lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="lead-perfil">
                  Você é
                </label>
                <select
                  id="lead-perfil"
                  required
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {PERFIS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <input
                  id="lead-consent"
                  type="checkbox"
                  required
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-musgo-700"
                />
                <label htmlFor="lead-consent" className="text-[13px] leading-relaxed text-musgo-700">
                  {CONSENT_TEXT}{" "}
                  <a
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-tinta"
                  >
                    Política de privacidade
                  </a>
                  .
                </label>
              </div>
            </div>

            {erro && (
              <p className="mt-4 border-l-4 border-ferrugem bg-papel px-3 py-2 text-[14px] text-ferrugem">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-6 w-full bg-ocre px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel disabled:opacity-60"
            >
              {enviando ? "ENVIANDO…" : "RECEBER O ARSENAL COMPACTO"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
