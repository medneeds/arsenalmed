import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LayoutDashboard, DollarSign, Users, Filter, Table2, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBrl } from "@/lib/product";
import { claimAdmin, getAdminDashboard, type DashboardData } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Arsenal Med" },
      {
        name: "description",
        content: "Faturamento, leads captados e funil de conversão do Arsenal Med.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel administrativo — Arsenal Med" },
      { property: "og:description", content: "Acompanhamento de vendas e leads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const PERIODOS = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
] as const;

const NAV_ITEMS = [
  { id: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "faturamento", label: "Faturamento", icon: DollarSign },
  { id: "leads", label: "Leads", icon: Users },
  { id: "funil", label: "Funil", icon: Filter },
  { id: "compras", label: "Compras e downloads", icon: Table2 },
] as const;

function dataCurta(dia: string) {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

function rolarPara(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dias, setDias] = useState<number>(30);
  const fetchDashboard = useServerFn(getAdminDashboard);
  const claim = useServerFn(claimAdmin);
  const [claimErro, setClaimErro] = useState<string | null>(null);

  const query = useQuery<DashboardData>({
    queryKey: ["admin-dashboard", dias],
    queryFn: () => fetchDashboard({ data: { dias } }),
    retry: false,
  });

  const semPermissao = query.isError && /forbidden/i.test(String(query.error));

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
        await query.refetch();
      } else {
        setClaimErro("Já existe um administrador. Peça acesso a quem administra a conta.");
      }
    } catch {
      setClaimErro("Não foi possível liberar o acesso agora.");
    }
  }

  const serie = query.data?.serie ?? [];
  const maxReceita = useMemo(
    () => Math.max(1, ...serie.map((d) => d.receitaCentavos)),
    [serie],
  );
  const [menuAberto, setMenuAberto] = useState(false);

  function navegar(id: string) {
    setMenuAberto(false);
    rolarPara(id);
  }

  const sidebarNav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Seções do painel">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => navegar(item.id)}
          className="flex h-11 items-center gap-3 rounded-[2px] px-3 text-left font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-150 transition-colors hover:bg-musgo-800 hover:text-papel focus-visible:bg-musgo-800 focus-visible:text-papel focus-visible:outline-none"
        >
          <item.icon className="h-4 w-4 shrink-0 text-ocre" aria-hidden />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  const sidebarTop = (
    <div className="border-b-2 border-musgo-700 px-5 py-5">
      <p className="label text-ocre">PAINEL INTERNO</p>
      <p className="mt-1 font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">
        Arsenal Med
      </p>
    </div>
  );

  const sidebarFooter = (
    <div className="border-t-2 border-musgo-700 p-3">
      <button
        type="button"
        onClick={sair}
        className="flex h-11 w-full items-center gap-3 rounded-[2px] px-3 font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-150 transition-colors hover:border-ocre hover:text-papel"
      >
        <LogOut className="h-4 w-4 shrink-0 text-ferrugem" aria-hidden />
        <span>Sair</span>
      </button>
    </div>
  );

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
        <p className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">
          Painel · Arsenal Med
        </p>
      </div>

      {/* Drawer mobile */}
      {menuAberto ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <button
            type="button"
            aria-label="Fechar menu"
            tabIndex={-1}
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-musgo-950/70"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r-2 border-musgo-700 bg-musgo-900">
            <div className="flex items-center justify-between border-b-2 border-musgo-700 px-4 py-4">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-ocre">
                Navegação
              </span>
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
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-musgo-700 bg-musgo-900 md:flex">
          {sidebarTop}
          {sidebarNav}
          {sidebarFooter}
        </aside>

        {/* Conteúdo */}
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto max-w-[1100px]">
            <header className="hidden flex-wrap items-end justify-between gap-4 border-b-2 border-musgo-700 pb-5 md:flex">
              <div>
                <p className="label text-ocre">PAINEL INTERNO</p>
                <h1 className="mt-2 text-2xl text-papel md:text-3xl">Arsenal Med — Acompanhamento</h1>
              </div>
            </header>

            {semPermissao ? (
              <section className="mt-10 border-2 border-musgo-700 bg-musgo-800 p-6">
                <h2 className="text-xl text-papel">Sua conta ainda não tem acesso</h2>
                <p className="mt-2 text-sm text-musgo-300">
                  Se esta é a primeira conta do painel, libere o acesso de administrador agora. Depois
                  disso, nenhuma outra conta consegue se liberar sozinha.
                </p>
                <button
                  type="button"
                  onClick={tornarAdmin}
                  className="mt-5 h-12 rounded-[2px] bg-ocre px-5 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900"
                >
                  Liberar meu acesso
                </button>
                {claimErro ? (
                  <p role="alert" className="mt-4 text-sm text-papel">
                    {claimErro}
                  </p>
                ) : null}
              </section>
            ) : null}

            {query.isLoading ? (
              <p className="mt-10 font-mono text-sm text-musgo-300">Carregando dados…</p>
            ) : null}

            {query.isError && !semPermissao ? (
              <p role="alert" className="mt-10 border-2 border-alerta/60 bg-musgo-800 p-4 text-sm text-papel">
                Não foi possível carregar os dados. Tente recarregar a página.
              </p>
            ) : null}

            {query.data ? (
              <Dashboard
                data={query.data}
                dias={dias}
                onDias={setDias}
                serie={serie}
                maxReceita={maxReceita}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function Dashboard({
  data,
  dias,
  onDias,
  serie,
  maxReceita,
}: {
  data: DashboardData;
  dias: number;
  onDias: (d: number) => void;
  serie: DashboardData["serie"];
  maxReceita: number;
}) {
  const funil = [
    { label: "Leads captados", valor: data.funil.leads },
    { label: "Checkouts iniciados", valor: data.funil.checkoutsIniciados },
    { label: "Compras pagas", valor: data.funil.comprasPagas },
  ];
  const topoFunil = Math.max(1, ...funil.map((f) => f.valor));

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.dias}
            type="button"
            onClick={() => onDias(p.dias)}
            aria-pressed={dias === p.dias}
            className={`h-11 rounded-[2px] border-2 px-4 font-heading text-xs font-bold uppercase tracking-[0.12em] ${
              dias === p.dias
                ? "border-ocre bg-ocre text-musgo-900"
                : "border-musgo-600 text-musgo-150 hover:border-ocre"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section id="visao-geral" className="mt-6 scroll-mt-24 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Faturamento total" valor={formatBrl(data.receita.totalCentavos)} />
        <Kpi titulo="Hoje" valor={formatBrl(data.receita.hojeCentavos)} />
        <Kpi titulo="Últimos 7 dias" valor={formatBrl(data.receita.seteDiasCentavos)} />
        <Kpi titulo="Últimos 30 dias" valor={formatBrl(data.receita.trintaDiasCentavos)} />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Compras pagas (período)" valor={String(data.funil.comprasPagas)} />
        <Kpi titulo="Leads (período)" valor={String(data.funil.leads)} />
        <Kpi
          titulo="Leads que compraram"
          valor={`${data.funil.leadsQueCompraram} · ${data.funil.taxaLeadParaCompra}%`}
        />
        <Kpi titulo="Ticket médio" valor={formatBrl(data.receita.ticketMedioCentavos)} />
      </section>

      <div id="faturamento" className="scroll-mt-24">
        <Bloco titulo="Faturamento por dia">
          <Grafico serie={serie} chave="receitaCentavos" cor="var(--ocre)" moeda />
        </Bloco>
      </div>

      <div id="leads" className="scroll-mt-24">
        <Bloco titulo="Leads captados por dia">
          <Grafico serie={serie} chave="leads" cor="var(--musgo-300)" />
        </Bloco>
      </div>

      <Bloco titulo="Compras pagas por dia">
        <Grafico serie={serie} chave="compras" cor="var(--ferrugem, #8E2A20)" />
      </Bloco>

      <div id="funil" className="scroll-mt-24">
        <Bloco titulo={`Funil de conversão — últimos ${dias} dias`}>
        <ul className="space-y-4">
          {funil.map((etapa) => (
            <li key={etapa.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-150">
                  {etapa.label}
                </span>
                <span className="font-mono text-lg text-papel">{etapa.valor}</span>
              </div>
              <div className="mt-2 h-3 w-full bg-musgo-900">
                <div
                  className="h-3 bg-ocre"
                  style={{ width: `${Math.round((etapa.valor / topoFunil) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-xs text-musgo-300">
          Conversão checkout → pago: {data.funil.taxaCheckoutParaPago}% · Conversão lead → compra:{" "}
          {data.funil.taxaLeadParaCompra}%
        </p>
      </Bloco>
      </div>

      <div id="compras" className="scroll-mt-24">
        <Bloco titulo="Compras e downloads">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-musgo-700">
                {["Data", "E-mail", "Valor", "Status", "Manual", "Catálogo", "Acesso até"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.compras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 font-mono text-sm text-musgo-300">
                    Nenhuma compra registrada ainda.
                  </td>
                </tr>
              ) : (
                data.compras.map((c) => (
                  <tr key={c.id} className="border-b border-musgo-700/60">
                    <td className="py-3 pr-4 font-mono text-xs text-musgo-150">
                      {dataHora(c.criadoEm)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-papel">{c.email}</td>
                    <td className="py-3 pr-4 font-mono text-sm text-papel">
                      {formatBrl(c.valorCentavos)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-ocre">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-musgo-150">
                      {c.downloadsManual}/5
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-musgo-150">
                      {c.temCatalogo ? `${c.downloadsCatalogo}/5` : "pendente"}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-musgo-300">
                      {dataHora(c.expiraEm)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Bloco>
      </div>

      <p className="mt-8 font-mono text-[11px] text-musgo-500">
        Máximo de {maxReceita > 0 ? formatBrl(maxReceita) : "R$ 0,00"} em um único dia no período.
      </p>
    </>
  );
}

function Kpi({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="border-2 border-musgo-700 bg-musgo-800 p-4">
      <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300">
        {titulo}
      </p>
      <p className="mt-2 font-mono text-2xl text-papel">{valor}</p>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-2 border-musgo-700 bg-musgo-800 p-4 md:p-6">
      <h2 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Grafico({
  serie,
  chave,
  cor,
  moeda = false,
}: {
  serie: DashboardData["serie"];
  chave: "leads" | "compras" | "receitaCentavos";
  cor: string;
  moeda?: boolean;
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={serie} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#3B4A2C" vertical={false} />
          <XAxis
            dataKey="dia"
            tickFormatter={dataCurta}
            tick={{ fill: "#A8B78C", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={16}
            axisLine={{ stroke: "#3B4A2C" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#A8B78C", fontSize: 11 }}
            tickFormatter={(v: number) => (moeda ? String(Math.round(v / 100)) : String(v))}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(176,138,62,0.12)" }}
            contentStyle={{
              background: "#1B2418",
              border: "2px solid #3B4A2C",
              borderRadius: 2,
              color: "#F5F2E6",
              fontSize: 12,
            }}
            labelFormatter={(l: string) => dataCurta(l)}
            formatter={(value: number) => [
              moeda ? formatBrl(value) : String(value),
              moeda ? "Faturamento" : chave === "leads" ? "Leads" : "Compras",
            ]}
          />
          <Bar dataKey={chave} radius={[2, 2, 0, 0]}>
            {serie.map((d) => (
              <Cell key={d.dia} fill={cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
