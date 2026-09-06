import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "COMO EU RECEBO O MATERIAL?",
    a: "Assim que o pagamento é confirmado, você recebe um e-mail com o link de download. No Pix, a confirmação costuma levar poucos minutos.",
  },
  {
    q: "É PDF OU PLATAFORMA?",
    a: "PDF. Funciona sem internet, no celular, no tablet e no computador. O sumário inteligente é clicável e o arquivo tem marcadores, então você chega em qualquer caso com um toque.",
  },
  {
    q: "POSSO IMPRIMIR?",
    a: "Pode. O material foi diagramado para leitura em tela e para impressão em A4.",
  },
  {
    q: "TEM ATUALIZAÇÃO?",
    a: "Sim. Correções e atualizações da versão 3.x chegam por e-mail, sem custo.",
  },
  {
    q: "E SE NÃO SERVIR PARA MIM?",
    a: "Você tem 7 dias para pedir reembolso integral, sem justificativa. Escreva para [EMAIL_SUPORTE].",
  },
  {
    q: "ISSO SUBSTITUI MINHA DECISÃO CLÍNICA?",
    a: "Não, e o material diz isso na abertura. São doses de referência para paciente adulto, não gestante, fora do contexto pediátrico. Não substituem a checagem em bula, o julgamento à beira do leito nem a padronização do seu serviço.",
  },
  {
    q: "QUAL A DIFERENÇA PARA O ARSENAL COMPACTO?",
    a: "O compacto é gratuito e traz 5 casos na íntegra, mais as 11 armadilhas. Não é um resumo: é um recorte. Os cinco casos são idênticos aos da edição completa.",
  },
];

export function Faq() {
  return (
    <section className="bg-papel px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[680px]">
        <p className="label text-musgo-500">PERGUNTAS FREQUENTES</p>
        <h2 className="mt-5 text-tinta">FAQ</h2>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-b border-musgo-300">
              <AccordionTrigger className="py-5 text-left font-heading text-base font-bold uppercase tracking-[0.08em] text-tinta hover:no-underline md:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[16px] leading-relaxed text-tinta">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
