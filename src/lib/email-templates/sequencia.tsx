// Sequência pós-Compacto: D+1 (valor), D+3 (método + vídeo), D+5 (o que vem no
// completo), D+7 (último lembrete). Todas com link de descadastro.
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import type { TemplateEntry } from './registry'

export interface SequenciaProps {
  nome?: string
  salesUrl?: string
  videoUrl?: string
  compactoUrl?: string
  descadastroUrl?: string
}

const papel = '#fdfcf8'
const papel2 = '#f4f2ea'
const tinta = '#222A1C'
const musgo700 = '#3E4A30'
const musgo300 = '#C3CAB2'
const ocre = '#B8860B'
const ferrugem = '#A0522D'

const p = { color: tinta, fontSize: 15, lineHeight: '23px', margin: '0 0 14px' } as const
const label = {
  color: musgo700,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: 'uppercase',
  margin: 0,
} as const

const DEFAULTS = {
  nome: 'Doutor(a)',
  salesUrl: 'https://arsenalmed.com.br',
  videoUrl: 'https://arsenalmed.com.br/#video',
  compactoUrl: 'https://arsenalmed.com.br/compacto',
  descadastroUrl: 'https://arsenalmed.com.br',
}

function primeiroNome(nome?: string) {
  return (nome || DEFAULTS.nome).trim().split(/\s+/)[0]
}

function Layout({
  preview,
  tag,
  children,
  descadastroUrl = DEFAULTS.descadastroUrl,
}: {
  preview: string
  tag: string
  children: ReactNode
  descadastroUrl?: string
}) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: papel2, margin: 0, padding: '24px 0' }}>
        <Container
          style={{
            backgroundColor: papel,
            border: `1px solid ${musgo300}`,
            maxWidth: 520,
            margin: '0 auto',
            padding: '32px 28px',
          }}
        >
          <Text style={label}>{tag}</Text>
          {children}
          <Text style={{ ...p, margin: '22px 0 0' }}>
            Artur Batista
            <br />
            <span style={{ color: musgo700, fontSize: 13 }}>
              Médico plantonista de emergência e UTI · CRM/MA 11788
            </span>
          </Text>
          <Hr style={{ borderColor: musgo300, margin: '26px 0 14px' }} />
          <Text style={{ color: musgo700, fontSize: 11, lineHeight: '16px', margin: 0 }}>
            Você recebe este e-mail porque baixou o Arsenal Compacto e autorizou comunicações sobre o
            Arsenal Med.{' '}
            <Link href={descadastroUrl} style={{ color: musgo700, textDecoration: 'underline' }}>
              Não quero mais receber
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

function Cta({ href, children, solid = true }: { href: string; children: ReactNode; solid?: boolean }) {
  return (
    <Section style={{ textAlign: 'center', margin: '22px 0 8px' }}>
      <Button
        href={href}
        style={{
          backgroundColor: solid ? ocre : 'transparent',
          border: solid ? 'none' : `1px solid ${musgo700}`,
          color: solid ? '#1c2412' : musgo700,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.5,
          padding: '13px 26px',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        {children}
      </Button>
    </Section>
  )
}

function H({ children }: { children: ReactNode }) {
  return (
    <Heading as="h1" style={{ color: tinta, fontSize: 21, fontWeight: 700, lineHeight: '28px', margin: '12px 0 14px' }}>
      {children}
    </Heading>
  )
}

// D+1 — valor: o cenário da hipercalemia e as três armadilhas
function D1(props: SequenciaProps) {
  const d = { ...DEFAULTS, ...props }
  return (
    <Layout preview="Potássio de 7,4, QRS alargado e o paciente conversando com você." tag="Arsenal Med · Cenário 05" descadastroUrl={d.descadastroUrl}>
      <H>{primeiroNome(d.nome)}, o cenário que mais derruba colegas</H>
      <Text style={p}>
        Potássio de 7,4, QRS alargado — e o paciente conversando com você. É o cenário 05 do seu
        Compacto, e é onde a calma engana.
      </Text>
      <Text style={p}>As três armadilhas que o caso mostra:</Text>
      <Text style={p}>
        <strong style={{ color: ferrugem }}>1. Parar no shift.</strong> Insulina e beta-agonista
        empurram o potássio para dentro da célula, mas não o tiram do corpo. Sem a etapa de
        eliminação, ele rebate em duas a quatro horas.
      </Text>
      <Text style={p}>
        <strong style={{ color: ferrugem }}>2. Cálcio em infusão lenta.</strong> O gluconato de
        cálcio estabiliza a membrana; a indicação é de minutos, não de horas.
      </Text>
      <Text style={p}>
        <strong style={{ color: ferrugem }}>3. Confiar no laboratório sem olhar o ECG.</strong> QRS
        largo, T alta e simétrica, P apagando: é o eletrocardiograma que define a gravidade, não o
        número.
      </Text>
      <Text style={p}>
        A ordem completa — reconhecer, primeiros minutos, prescrição pronta e quando escalar — está no
        PDF. Se o link de download expirou, peça de novo: chega na hora.
      </Text>
      <Cta href={d.compactoUrl} solid={false}>Receber o Compacto de novo</Cta>
    </Layout>
  )
}

// D+3 — método: por que começar pelo cenário + vídeo
function D3(props: SequenciaProps) {
  const d = { ...DEFAULTS, ...props }
  return (
    <Layout preview="Às três da manhã, ninguém procura antiarrítmico." tag="Arsenal Med · Por que por cenário" descadastroUrl={d.descadastroUrl}>
      <H>Às três da manhã, ninguém procura “antiarrítmico”</H>
      <Text style={p}>
        Em cinco anos de plantão percebi que a maior parte do nosso tempo não é gasta decidindo. É gasta
        organizando o que já foi decidido: procurando a diluição, refazendo a conta da vazão, abrindo
        três aplicativos para montar uma prescrição.
      </Text>
      <Text style={p}>
        Todo guia de prescrição é organizado como a farmacologia é ensinada — por classe de fármaco. Faz
        sentido na prova. No plantão, você procura o que fazer com a taquicardia instável que está no
        monitor agora.
      </Text>
      <Text style={p}>
        Por isso o Arsenal inverte a entrada: primeiro o cenário, depois o fármaco. Todos os casos têm a
        mesma anatomia — o caso, o que está em jogo, reconhecer, primeiros minutos, prescrição pronta,
        armadilhas e quando escalar. Depois do primeiro, você já sabe onde olhar.
      </Text>
      <Text style={p}>Gravei um vídeo de 2 minutos e meio mostrando isso com a hipercalemia aberta, do ECG às armadilhas.</Text>
      <Cta href={d.videoUrl}>Assistir ao vídeo</Cta>
    </Layout>
  )
}

// D+5 — oferta: o que vem no completo
function D5(props: SequenciaProps) {
  const d = { ...DEFAULTS, ...props }
  return (
    <Layout preview="O Compacto tem 5 cenários. O Arsenal Med 3.0 tem 33 — e o catálogo de fármacos." tag="Arsenal Med 3.0 · Edição completa" descadastroUrl={d.descadastroUrl}>
      <H>O Compacto tem 5 cenários. O completo tem 33.</H>
      <Text style={p}>O Arsenal Med 3.0 vem em dois volumes:</Text>
      <Text style={p}>
        <strong>Manual completo</strong> — os 33 cenários do paciente grave ou potencialmente grave,
        no mesmo formato do Compacto que você já conhece.
      </Text>
      <Text style={p}>
        <strong>Catálogo de Fármacos (bônus)</strong> — com a diluição e a concentração final
        explícitas, e 10 tabelas de referência, como vasoativos por peso e ajuste renal.
      </Text>
      <Text style={p}>
        Abre off-line no celular, no tablet ou no computador — porque dentro do hospital a internet pode
        falhar. As atualizações da versão 3 estão incluídas.
      </Text>
      <Text style={{ ...p, fontSize: 17 }}>
        De <span style={{ textDecoration: 'line-through', color: musgo700 }}>R$ 199,90</span> por{' '}
        <strong>R$ 99,90</strong>, pagamento único. 7 dias de garantia.
      </Text>
      <Cta href={d.salesUrl}>Garantir meu Arsenal</Cta>
    </Layout>
  )
}

// D+7 — último lembrete, com a garantia como reversão de risco
function D7(props: SequenciaProps) {
  const d = { ...DEFAULTS, ...props }
  return (
    <Layout preview="Sete dias de garantia: se não servir para a sua prática, o reembolso é integral." tag="Arsenal Med · Último lembrete" descadastroUrl={d.descadastroUrl}>
      <H>{primeiroNome(d.nome)}, este é o último e-mail sobre o Arsenal</H>
      <Text style={p}>
        Não vou insistir. Se o Compacto foi útil no seu plantão, os outros 28 cenários seguem o mesmo
        formato — e o risco é meu.
      </Text>
      <Text style={p}>
        Você tem 7 dias de garantia: se não servir para a sua prática, pede o reembolso integral, sem
        justificativa.
      </Text>
      <Text style={p}>Arsenal Med 3.0 · 2 volumes · R$ 99,90 em pagamento único.</Text>
      <Cta href={d.salesUrl}>Quero os 33 cenários</Cta>
    </Layout>
  )
}

const previewData = {
  nome: 'Artur Batista',
  salesUrl: 'https://arsenalmed.com.br',
  videoUrl: 'https://arsenalmed.com.br/#video',
  compactoUrl: 'https://arsenalmed.com.br/compacto',
  descadastroUrl: 'https://arsenalmed.com.br/api/public/descadastrar?e=x&t=y',
}

export const templateD1 = {
  component: D1,
  subject: (d: Record<string, any>) => `${primeiroNome(d['nome'])}, o cenário que mais derruba colegas`,
  displayName: 'Sequência Compacto · D+1 — hipercalemia e armadilhas',
  previewData,
} satisfies TemplateEntry

export const templateD3 = {
  component: D3,
  subject: 'Às três da manhã, ninguém procura “antiarrítmico”',
  displayName: 'Sequência Compacto · D+3 — por que por cenário (vídeo)',
  previewData,
} satisfies TemplateEntry

export const templateD5 = {
  component: D5,
  subject: 'O Compacto tem 5 cenários. O completo tem 33.',
  displayName: 'Sequência Compacto · D+5 — edição completa',
  previewData,
} satisfies TemplateEntry

export const templateD7 = {
  component: D7,
  subject: (d: Record<string, any>) => `${primeiroNome(d['nome'])}, último e-mail sobre o Arsenal`,
  displayName: 'Sequência Compacto · D+7 — último lembrete',
  previewData,
} satisfies TemplateEntry
