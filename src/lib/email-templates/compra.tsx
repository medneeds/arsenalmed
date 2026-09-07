import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface CompraEmailProps {
  accessUrl?: string
}

const papel = '#fdfcf8'
const papel2 = '#f4f2ea'
const tinta = '#222A1C'
const musgo700 = '#3E4A30'
const musgo300 = '#C3CAB2'
const ocre = '#B8860B'

function CompraEmail({ accessUrl = 'https://www.arsenalmed.com.br' }: CompraEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Pagamento confirmado — seus dois volumes do Arsenal Med estão liberados.</Preview>
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
          <Text style={{ color: musgo700, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
            Arsenal Med 3.0 · Compra confirmada
          </Text>
          <Heading as="h1" style={{ color: tinta, fontSize: 22, fontWeight: 700, margin: '12px 0 8px' }}>
            Seus dois volumes estão liberados.
          </Heading>
          <Text style={{ color: tinta, fontSize: 15, lineHeight: '22px', margin: '0 0 12px' }}>
            Obrigado pela compra. Na página abaixo você encontra o <strong>Manual Completo</strong> e o <strong>Catálogo de Fármacos e Tabelas</strong>.
          </Text>
          <Text style={{ color: musgo700, fontSize: 13, lineHeight: '20px', margin: '0 0 20px' }}>
            O acesso de entrega fica disponível por 7 dias. Depois de baixar, guarde os PDFs no seu dispositivo para consulta off-line.
          </Text>
          <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
            <Button
              href={accessUrl}
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
              Acessar meus arquivos
            </Button>
          </Section>
          <Text style={{ color: musgo700, fontSize: 12, lineHeight: '18px', margin: '0 0 4px' }}>
            Se o botão não abrir, copie e cole este link no navegador:
          </Text>
          <Link href={accessUrl} style={{ color: musgo700, fontSize: 12, wordBreak: 'break-all' }}>
            {accessUrl}
          </Link>
          <Text style={{ color: musgo700, fontSize: 11, lineHeight: '17px', margin: '28px 0 0' }}>
            Material destinado a médicos. Doses de referência não substituem bula, julgamento clínico ou padronização institucional.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: CompraEmail,
  subject: 'Arsenal Med 3.0 — seus arquivos estão liberados',
  displayName: 'Entrega da compra',
  previewData: { accessUrl: 'https://www.arsenalmed.com.br/download?token=exemplo' },
}
