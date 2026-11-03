// Origem da visita no navegador: session_id anônimo e primeiro/último toque
// no localStorage. Só roda no navegador (chamado de efeitos e do track()).
import {
  atualizarToques,
  detectarDispositivo,
  origemFormulario,
  resumoToque,
  toqueDaUrl,
  type Dispositivo,
  type Toques,
} from "@/lib/atribuicao";
import type { RastreioInput } from "@/lib/rastreio";

const CHAVE_TOQUES = "arsenal_toques_v1";
const CHAVE_SESSAO = "arsenal_sid_v1";

let ultimaUrlCapturada: string | null = null;

function lerToques(): Toques | null {
  try {
    const raw = window.localStorage.getItem(CHAVE_TOQUES);
    return raw ? (JSON.parse(raw) as Toques) : null;
  } catch {
    return null;
  }
}

function novoUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function obterSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let sid = window.localStorage.getItem(CHAVE_SESSAO);
    if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
      sid = novoUuid();
      window.localStorage.setItem(CHAVE_SESSAO, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

/** Registra a chegada. Idempotente por URL: pode ser chamado várias vezes. */
export function capturarVisita(): void {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  if (url === ultimaUrlCapturada) return;
  const primeiraDaPagina = ultimaUrlCapturada === null;
  ultimaUrlCapturada = url;
  // Navegação interna sem UTM não é uma nova chegada.
  if (!primeiraDaPagina && !/[?&]utm_/.test(window.location.search)) return;
  try {
    const agora = new Date();
    const novo = toqueDaUrl(url, primeiraDaPagina ? document.referrer : "", agora);
    const toques = atualizarToques(lerToques(), novo, agora);
    window.localStorage.setItem(CHAVE_TOQUES, JSON.stringify(toques));
  } catch {
    // Medição nunca pode atrapalhar a navegação.
  }
}

export function dispositivoAtual(): Dispositivo {
  if (typeof window === "undefined") return "desktop";
  return detectarDispositivo(navigator.userAgent, window.screen?.width);
}

export function contextoDoEvento() {
  capturarVisita();
  const t = lerToques()?.ultimo ?? null;
  return {
    session_id: obterSessionId(),
    utm_source: t?.utm_source ?? null,
    utm_medium: t?.utm_medium ?? null,
    utm_campaign: t?.utm_campaign ?? null,
    utm_content: t?.utm_content ?? null,
    dispositivo: dispositivoAtual(),
  };
}

/** Dados de origem para o cadastro e o checkout. */
export function rastreioParaEnvio(origem?: string): RastreioInput {
  if (typeof window === "undefined") return {};
  capturarVisita();
  const toques = lerToques();
  const u = toques?.ultimo ?? null;
  return {
    session_id: obterSessionId(),
    utm_source: u?.utm_source ?? null,
    utm_medium: u?.utm_medium ?? null,
    utm_campaign: u?.utm_campaign ?? null,
    utm_content: u?.utm_content ?? null,
    utm_term: u?.utm_term ?? null,
    primeiro_utm: resumoToque(toques?.primeiro ?? null),
    referrer: u?.referrer ?? null,
    pagina_entrada: u?.pagina_entrada ?? null,
    dispositivo: dispositivoAtual(),
    ...(origem !== undefined ? { origem_formulario: origemFormulario(origem) } : {}),
  };
}
