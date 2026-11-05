import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getLeadTimeline } from "@/lib/painel.functions";
import { SEM_UTM_LABEL } from "@/lib/painel-metricas";
import { brl, dataHora } from "./painel-ui";

const NOMES: Record<string, string> = {
  page_view: "Viu a página",
  view_landing: "Abriu a página",
  vsl_play: "Ativou o som da VSL",
  vsl_progress: "Assistiu a VSL",
  explore_product: "Clicou para conhecer o produto",
  click_buy: "Clicou em comprar",
  open_compacto: "Abriu o formulário do Compacto",
  submit_compacto: "Enviou o formulário",
  checkout_started: "Iniciou o checkout",
  payment_return: "Voltou do pagamento",
  payment_confirmed: "Pagamento confirmado",
  download_manual: "Baixou o Manual",
  download_catalogo: "Baixou o Catálogo",
  click_buyer_area: "Clicou em Área do comprador",
};

export function LeadTimeline({ email, onClose }: { email: string | null; onClose: () => void }) {
  const buscar = useServerFn(getLeadTimeline);
  const q = useQuery({
    queryKey: ["admin-lead-timeline", email],
    queryFn: () => buscar({ data: { email: email! } }),
    enabled: !!email,
    retry: false,
  });

  return (
    <Sheet open={!!email} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <SheetContent side="right" className="w-full overflow-y-auto rounded-none border-l-2 border-musgo-700 bg-musgo-900 p-0 text-papel sm:max-w-md">
        <div className="border-b-2 border-musgo-700 px-5 py-5 pr-12">
          <p className="label text-ocre">LINHA DO TEMPO</p>
          <SheetTitle className="mt-1 font-heading text-lg font-bold uppercase tracking-[0.06em] text-papel">
            {q.data?.lead.nome ?? "Lead"}
          </SheetTitle>
          <SheetDescription className="mt-1 font-mono text-xs text-musgo-300">{email}</SheetDescription>
          {q.data ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[11px]">
              <dt className="text-musgo-500">Campanha</dt>
              <dd className="text-musgo-150">{q.data.lead.campanha ?? SEM_UTM_LABEL}</dd>
              <dt className="text-musgo-500">Criativo</dt>
              <dd className="text-musgo-150">{q.data.lead.criativo ?? "—"}</dd>
              <dt className="text-musgo-500">Perfil</dt>
              <dd className="text-musgo-150">{q.data.lead.perfil}</dd>
              <dt className="text-musgo-500">Dispositivo</dt>
              <dd className="text-musgo-150">{q.data.lead.dispositivo ?? "—"}</dd>
            </dl>
          ) : null}
        </div>

        <div className="px-5 py-5">
          {q.isLoading ? <p className="font-mono text-sm text-musgo-300">Carregando…</p> : null}
          {q.isError ? <p role="alert" className="font-mono text-sm text-alerta-claro">Não foi possível carregar a linha do tempo.</p> : null}
          {q.data === null ? <p className="font-mono text-sm text-musgo-300">Lead não encontrado.</p> : null}
          {q.data && !q.data.lead.temSessao ? (
            <p className="mb-4 border border-musgo-700 p-3 font-mono text-[11px] leading-relaxed text-musgo-300">
              Este lead se cadastrou antes da medição de navegação; só aparecem o cadastro, os e-mails e as compras.
            </p>
          ) : null}

          {q.data ? (
            <ol className="relative border-l-2 border-musgo-700 pl-5">
              {q.data.itens.map((it, i) => {
                let titulo = "";
                let detalhe: string | null = null;
                let destaque = false;
                if (it.tipo === "evento") {
                  titulo = it.email ? "Clicou no e-mail da sequência" : (NOMES[it.evento] ?? it.evento);
                  detalhe = [it.detalhe, it.pagina].filter(Boolean).join(" · ") || null;
                  destaque = it.email || it.evento === "checkout_started" || it.evento === "click_buy";
                } else if (it.tipo === "email") {
                  titulo = `E-mail da sequência enviado (${it.etapa})`;
                  destaque = true;
                } else if (it.tipo === "cadastro") {
                  titulo = "Cadastro no Compacto";
                  detalhe = it.detalhe;
                  destaque = true;
                } else {
                  titulo = it.bonus ? "Bônus MedStation liberado" : `Compra ${it.status}`;
                  detalhe = it.bonus ? null : brl(it.valorCentavos);
                  destaque = true;
                }
                return (
                  <li key={i} className="mb-4 last:mb-0">
                    <span className={`absolute -left-[7px] mt-1.5 h-3 w-3 border-2 ${destaque ? "border-ocre bg-ocre" : "border-musgo-500 bg-musgo-900"}`} aria-hidden />
                    <p className="font-mono text-[11px] text-musgo-500">{dataHora(it.em)}</p>
                    <p className={`text-sm ${destaque ? "text-papel" : "text-musgo-150"}`}>{titulo}</p>
                    {detalhe ? <p className="font-mono text-[11px] text-musgo-300">{detalhe}</p> : null}
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
