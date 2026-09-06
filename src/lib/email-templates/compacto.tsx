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
import type { TemplateEntry } from './registry'

export interface CompactoEmailProps {
  nome?: string
  downloadUrl?: string
  salesUrl?: string
}

const papel = '#fdfcf8'
const papel2 = '#f4f2ea'
const tinta = '#222A1C'
const musgo700 = '#3E4A30'
const musgo300 = '#C3CAB2'
const ocre = '#B8860B'

function CompactoEmail({
  nome = 'Doutor(a)',
  downloadUrl = 'https://arsenalmed.com.br',
  salesUrl = 'https://www.arsenalmed.com.br',
}: CompactoEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu Arsenal Compacto chegou — 5 cenários do paciente grave.</Preview>
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
          <Text
            style={{
              color: musgo700,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Arsenal Med · Compacto
          </Text>
          <Heading
            as="h1"
            style={{ color: tinta, fontSize: 22, fontWeight: 700, margin: '12px 0 8px' }}
          >
            {nome.split(' ')[0]}, seu guia chegou.
          </Heading>
          <Text style={{ color: tinta, fontSize: 15, lineHeight: '22px', margin: '0 0 20px' }}>
            São cinco cenários do paciente grave, na ordem em que você precisa deles na beira do
            leito. O link abaixo fica ativo por 24 horas.
          </Text>
          <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
            <Button
              href={downloadUrl}
              style={{
                backgroundColor: ocre,
                color: '#1c2412',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: '12px 28px',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Baixar o Arsenal Compacto
            </Button>
          </Section>
          <Text style={{ color: musgo700, fontSize: 12, lineHeight: '18px', margin: '0 0 4px' }}>
            Se o botão não abrir, copie e cole este link no navegador:
          </Text>
          <Link href={downloadUrl} style={{ color: musgo700, fontSize: 12, wordBreak: 'break-all' }}>
            {downloadUrl}
          </Link>

          <Hr style={{ borderColor: musgo300, margin: '28px 0' }} />

          <Text
            style={{
              color: musgo700,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            O guia completo
          </Text>
          <Text style={{ color: tinta, fontSize: 15, lineHeight: '22px', margin: '0 0 8px' }}>
            O Compacto tem cinco cenários. O <strong>Arsenal Med 3.0</strong> tem todos os 33
            cenários do paciente grave, o catálogo de fármacos e as 10 tabelas de referência — o
            guia de bolso completo do plantão, off-line, por R$ 69,90.
          </Text>
          <Section style={{ textAlign: 'center', margin: '16px 0 8px' }}>
            <Button
              href={salesUrl}
              style={{
                border: `1px solid ${musgo700}`,
                color: musgo700,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: '12px 28px',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Ver o Arsenal Med 3.0
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CompactoEmail,
  subject: 'Seu Arsenal Compacto: 5 cenários do paciente grave',
  displayName: 'Arsenal Compacto — entrega + oferta 3.0',
  previewData: {
    nome: 'Artur Batista',
    downloadUrl: 'https://example.com/download/compacto',
    salesUrl: 'https://www.arsenalmed.com.br',
  },
} satisfies TemplateEntry
