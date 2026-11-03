import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  ClipboardCopy,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Table2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin, getAdminDashboard, type DashboardData } from "@/lib/admin.functions";
import { getStripeArsenalResumo, type StripeResumoResult } from "@/lib/admin-stripe.functions";
import { getPainelCampanhas, getRelatorioMarkdown } from "@/lib/painel.functions";
import { resolverPeriodo, diaLocal, type PeriodoTipo } from "@/lib/periodo";
import type { PainelDados } from "@/lib/painel.server";
import { SecaoVisaoGeral } from "@/components/admin/SecaoVisaoGeral";
import { SecaoCampanhas } from "@/components/admin/SecaoCampanhas";
import { SecaoLeads } from "@/components/admin/SecaoLeads";
import { SecaoComportamento } from "@/components/admin/SecaoComportamento";
import { SecaoSequencia } from "@/components/admin/SecaoSequencia";
import { SecaoInvestimento } from "@/components/admin/SecaoInvestimento";
import { SecaoStripe } from "@/components/admin/SecaoStripe";
import { SecaoCompras } from "@/components/admin/SecaoCompras";
import { LeadTimeline } from "@/components/admin/LeadTimeline";
import { dataCurta, inputPainel } from "@/components/admin/painel-ui";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Arsenal Med" },
      { name: "description", content: "Campanhas, leads, comportamento e faturamento do Arsenal Med." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel administrativo — Arsenal Med" },
      { property: "og:description", content: "Acompanhamento de campanhas, leads e vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const PERIODOS: { id: PeriodoTipo; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "90", label: "90 dias" },
  { id: "custom", label: "Personalizado" },
];

const NAV_ITEMS = [
  { id: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "campanhas", label: "Campanhas", icon: Megaphone },
  { id: "leads", label: "Leads", icon: Users },
  { id: "comportamento", label: "Comportamento", icon: Activity },
  { id: "sequencia", label: "Sequência de e-mails", icon: Mail },
  { id: "investimento", label: "Investimento", icon: Wallet },
  { id: "stripe-arsenal", label: "Arsenal Med (Stripe)", icon: CreditCard },
  { id: "compras", label: "Compras e downloads", icon: Table2 },
] as const;

type SecaoId = (typeof NAV_ITEMS)[number]["id"];

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [secao, setSecao] = useState<SecaoId>("visao-geral");
  const [menuAberto, setMenuAberto] = useState(false);
  const [tipo, setTipo] = useState<PeriodoTipo>("30");
  const hoje = diaLocal(new Date());
  const [custom, setCustom] = useState({ desde: hoje, ate: hoje });
  const periodo = useMemo(() => resolverPeriodo(tipo, new Date(), custom), [tipo, custom]);
  const [leadAberto, setLeadAberto] = useState<string | null>(null);

  const fetchDashboard = useServerFn(getAdminDashboard);
  const fetchStripe = useServerFn(getStripeArsenalResumo);
  const fetchPainel = useServerFn(getPainelCampanhas);
  const fetchRelatorio = useServerFn(getRelatorioMarkdown);
  const claim = useServerFn(claimAdmin);
  const [claimErro, setClaimErro] = useState<string | null>(null);

  const query = useQuery<DashboardData>({
    queryKey: ["admin-dashboard", periodo],
    queryFn: () => fetchDashboard({ data: periodo }),
    retry: false,
  });
  const painelQuery = useQuery<PainelDados>({
    queryKey: ["admin-painel", periodo],
    queryFn: () => fetchPainel({ data: periodo }),
    retry: false,
  });
  const stripeQuery = useQuery<StripeResumoResult>({
    queryKey: ["admin-stripe-arsenal", periodo],
    queryFn: () => fetchStripe({ data: { ...periodo, environment: "live" } }),
    retry: false,
    enabled: secao === "stripe-arsenal",
  });

  const [sincronizando, setSincronizando] = useState(false);
  const atualizadoEm = useMemo(() => {
    const ts = Math.max(query.dataUpdatedAt ?? 0, painelQuery.dataUpdatedAt ?? 0);
    return ts ? new Date(ts) : null;
  }, [query.dataUpdatedAt, painelQuery.dataUpdatedAt]);

  async function sincronizar() {
    setSincronizando(true);
    try {
      await Promise.all([query.refetch(), painelQuery.refetch(), secao === "stripe-arsenal" ? stripeQuery.refetch() : null]);
    } finally {
      setSincronizando(false);
    }
  }

  const [copiando, setCopiando] = useState(false);
  const [copiaMsg, setCopiaMsg] = useState<string | null>(null);
  const [textoManual, setTextoManual] = useState<string | null>(null);
  async function copiarRelatorio() {
    setCopiando(true);
    setCopiaMsg(null);
    setTextoManual(null);
    try {
      const { markdown } = await fetchRelatorio({ data: periodo });
      try {
        await navigator.clipboard.writeText(markdown);
        setCopiaMsg("Relatório copiado.");
      } catch {
        setTextoManual(markdown);
        setCopiaMsg("Não deu para copiar automaticamente. Selecione o texto abaixo e copie.");
      }
    } catch {
      setCopiaMsg("Não foi possível gerar o relatório agora.");
    } finally {
      setCopiando(false);
    }
  }

  const semPermissao =
    (query.isError && /forbidden/i.test(String(query.error))) ||
    (painelQuery.isError && /forbidden/i.test(String(painelQuery.error)));

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  async function tornarAdmin() {
    setClaimErro(null);
    try {
      const res = await claim({ data: undefined });
      if (res.isAdmin) {
        await Promise.all([query.refetch(), painelQuery.refetch()]);
      } else {
        setClaimErro("Já existe um administrador. Peça acesso a quem administra a conta.");
      }
    } catch {
      setClaimErro("Não foi possível liberar o acesso agora.");
    }
  }

  function navegar(id: SecaoId) {
    setMenuAberto(false);
    setSecao(id);
    window.scrollTo({ top: 0 });
  }

  const tituloSecao = NAV_ITEMS.find((n) => n.id === secao)?.label ?? "";

  const sidebarNav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Seções do painel">
      {NAV_ITEMS.map((item) => {
        const ativo = secao === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navegar(item.id)}
            aria-current={ativo ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-[2px] px-3 text-left font-heading text-xs font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none ${
              ativo ? "bg-musgo-800 text-papel" : "text-musgo-150 hover:bg-musgo-800 hover:text-papel focus-visible:bg-musgo-800"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0 text-ocre" aria-hidden />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const sidebarTop = (
    <div className="border-b-2 border-musgo-700 px-5 py-5">
      <p className="label text-ocre">PAINEL INTERNO</p>
      <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">Arsenal Med</p>
    </div>
  );

  const sidebarFooter = (
    <div className="border-t-2 border-musgo-700 p-3">
      <button
        type="button"
        onClick={sair}
        className="flex h-11 w-full items-center gap-3 rounded-[2px] px-3 font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-150 transition-colors hover:text-papel"
      >
        <LogOut className="h-4 w-4 shrink-0 text-ferrugem" aria-hidden />
        <span>Sair</span>
      </button>
    </div>
  );

  const painel = painelQuery.data;
  const carregandoPainel = painelQuery.isLoading;

  return (
    <div className="min-h-screen bg-musgo-900">
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b-2 border-musgo-700 bg-musgo-900 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          className="flex h-11 w-11 items-center justify-center rounded-[2px] border-2 border-musgo-600 text-musgo-150 hover:border-ocre hover:text-papel"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <p className="truncate font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">{tituloSecao}</p>
      </div>

      {menuAberto ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <button type="button" aria-label="Fechar menu" tabIndex={-1} onClick={() => setMenuAberto(false)} className="absolute inset-0 bg-musgo-950/70" />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r-2 border-musgo-700 bg-musgo-900">
            <div className="flex items-center justify-between border-b-2 border-musgo-700 px-4 py-4">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-ocre">Navegação</span>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center rounded-[2px] border-2 border-musgo-600 text-musgo-150 hover:border-ocre hover:text-papel"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {sidebarTop}
            {sidebarNav}
            {sidebarFooter}
          </aside>
        </div>
      ) : null}

      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-musgo-700 bg-musgo-900 md:flex">
          {sidebarTop}
          {sidebarNav}
          {sidebarFooter}
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-12 md:px-8">
          <div className="mx-auto max-w-[1280px]">
            {/* Topo fixo: título, período e ações */}
            <header className="sticky top-14 z-20 -mx-4 border-b-2 border-musgo-700 bg-musgo-900 px-4 pb-4 pt-4 md:top-0 md:-mx-8 md:px-8 md:pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="hidden md:block">
                  <p className="label text-ocre">PAINEL INTERNO</p>
                  <h1 className="mt-1 text-2xl text-papel">{tituloSecao}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[11px] text-musgo-300">
                    {atualizadoEm
                      ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" })}`
                      : "Sincronizando…"}
                  </p>
                  <button
                    type="button"
                    onClick={sincronizar}
                    disabled={sincronizando}
                    className="h-10 rounded-[2px] border-2 border-musgo-600 px-3 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-150 hover:border-ocre hover:text-papel disabled:opacity-60"
                  >
                    {sincronizando ? "Atualizando…" : "Atualizar"}
                  </button>
                  <button
                    type="button"
                    onClick={copiarRelatorio}
                    disabled={copiando}
                    className="flex h-10 items-center gap-2 rounded-[2px] bg-ocre px-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-900 disabled:opacity-60"
                  >
                    <ClipboardCopy className="h-4 w-4" aria-hidden />
                    {copiando ? "Gerando…" : "Copiar relatório"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
                  {PERIODOS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTipo(p.id)}
                      aria-pressed={tipo === p.id}
                      className={`h-9 rounded-[2px] border-2 px-3 font-heading text-[11px] font-bold uppercase tracking-[0.12em] ${
                        tipo === p.id ? "border-ocre bg-ocre text-musgo-900" : "border-musgo-600 text-musgo-150 hover:border-ocre"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {tipo === "custom" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="periodo-desde">De</label>
                    <input id="periodo-desde" type="date" value={custom.desde} max={hoje} onChange={(e) => setCustom((c) => ({ ...c, desde: e.target.value }))} className={`${inputPainel} h-9 w-[150px]`} />
                    <span className="font-mono text-xs text-musgo-300">até</span>
                    <label className="sr-only" htmlFor="periodo-ate">Até</label>
                    <input id="periodo-ate" type="date" value={custom.ate} max={hoje} onChange={(e) => setCustom((c) => ({ ...c, ate: e.target.value }))} className={`${inputPainel} h-9 w-[150px]`} />
                  </div>
                ) : null}
                <p className="font-mono text-[11px] text-musgo-500">
                  {periodo.desde === periodo.ate ? dataCurta(periodo.desde) : `${dataCurta(periodo.desde)} – ${dataCurta(periodo.ate)}`} · Fortaleza
                </p>
              </div>

              {copiaMsg ? (
                <p role="status" className="mt-2 font-mono text-xs text-ocre">
                  {copiaMsg}
                </p>
              ) : null}
            </header>

            {textoManual ? (
              <textarea
                readOnly
                value={textoManual}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Relatório em texto"
                className="mt-4 h-64 w-full rounded-[2px] border-2 border-musgo-600 bg-musgo-800 p-3 font-mono text-xs text-papel"
              />
            ) : null}

            {semPermissao ? (
              <section className="mt-8 border-2 border-musgo-700 bg-musgo-800 p-6">
                <h2 className="text-xl text-papel">Sua conta ainda não tem acesso</h2>
                <p className="mt-2 text-sm text-musgo-300">
                  Se esta é a primeira conta do painel, libere o acesso de administrador agora. Depois disso, nenhuma outra conta consegue se liberar sozinha.
                </p>
                <button type="button" onClick={tornarAdmin} className="mt-5 h-12 rounded-[2px] bg-ocre px-5 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900">
                  Liberar meu acesso
                </button>
                {claimErro ? (
                  <p role="alert" className="mt-4 text-sm text-papel">
                    {claimErro}
                  </p>
                ) : null}
              </section>
            ) : null}

            {!semPermissao && painelQuery.isError ? (
              <p role="alert" className="mt-6 border-2 border-alerta/60 bg-musgo-800 p-4 text-sm text-papel">
                Não foi possível carregar campanhas e leads. Tente “Atualizar”.
              </p>
            ) : null}

            {!semPermissao ? (
              <>
                {secao === "visao-geral" ? <SecaoVisaoGeral painel={painel} dashboard={query.data} /> : null}
                {secao === "campanhas" ? (painel ? <SecaoCampanhas dados={painel} /> : <Carregando ativo={carregandoPainel} />) : null}
                {secao === "leads" ? (painel ? <SecaoLeads leads={painel.leads} onAbrirLead={setLeadAberto} /> : <Carregando ativo={carregandoPainel} />) : null}
                {secao === "comportamento" ? (painel ? <SecaoComportamento dados={painel} /> : <Carregando ativo={carregandoPainel} />) : null}
                {secao === "sequencia" ? (painel ? <SecaoSequencia dados={painel} onAbrirLead={setLeadAberto} /> : <Carregando ativo={carregandoPainel} />) : null}
                {secao === "investimento" ? (
                  painel ? <SecaoInvestimento dados={painel} onSalvo={() => void painelQuery.refetch()} /> : <Carregando ativo={carregandoPainel} />
                ) : null}
                {secao === "stripe-arsenal" ? (
                  <SecaoStripe carregando={stripeQuery.isLoading} resultado={stripeQuery.data} falhou={stripeQuery.isError} />
                ) : null}
                {secao === "compras" ? (query.data ? <SecaoCompras compras={query.data.compras} /> : <Carregando ativo={query.isLoading} />) : null}
              </>
            ) : null}
          </div>
        </main>
      </div>

      <LeadTimeline email={leadAberto} onClose={() => setLeadAberto(null)} />
    </div>
  );
}

function Carregando({ ativo }: { ativo: boolean }) {
  return ativo ? <p className="mt-8 font-mono text-sm text-musgo-300">Carregando dados…</p> : null;
}
