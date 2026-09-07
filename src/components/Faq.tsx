import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "COMO EU RECEBO O MATERIAL?",
    a: "Assim que o pagamento é confirmado, a página de entrega libera dois arquivos: o Manual Completo e o Catálogo de Fármacos e Tabelas. O mesmo acesso também é enviado por e-mail. No Pix, a confirmação pode levar alguns minutos.",
  },
  {
    q: "É PDF OU PLATAFORMA?",
    a: "São PDFs. Funcionam sem internet, no celular, no tablet e no computador. O sumário é clicável e os arquivos têm marcadores para consulta rápida.",
  },
  {
    q: "O CATÁLOGO ESTÁ INCLUÍDO?",
    a: "Sim. A compra entrega dois volumes: o Arsenal Med 3.0 — Manual Completo e, como bônus, o Catálogo de Fármacos e Tabelas em um segundo PDF.",
  },
  {
    q: "POSSO IMPRIMIR?",
    a: "Pode. O material foi diagramado para leitura em tela e também pode ser impresso em A4.",
  },
  {
    q: "TEM ATUALIZAÇÃO?",
    a: "Sim. Correções e atualizações da versão 3.x são enviadas sem custo adicional para o e-mail da compra.",
  },
  {
    q: "E SE NÃO SERVIR PARA MIM?",
    a: "Você tem 7 dias para solicitar reembolso integral. Use o canal de suporte informado no e-mail e na confirmação da compra.",
  },
  {
    q: "ISSO SUBSTITUI MINHA DECISÃO CLÍNICA?",
    a: "Não. O material é destinado a médicos e traz doses de referência. Não substitui bula, julgamento clínico à beira do leito nem a padronização do seu serviço. Situações de gestação são sinalizadas separadamente e o conteúdo não é pediátrico.",
  },
  {
    q: "QUAL A DIFERENÇA PARA O ARSENAL COMPACTO?",
    a: "O Compacto é gratuito e traz 5 casos na íntegra mais as 11 armadilhas. Não é um resumo: é um recorte do formato do Arsenal Med completo.",
  },
  {
    q: "POR QUANTO TEMPO POSSO BAIXAR?",
    a: "O acesso de entrega fica ativo por 7 dias a partir da confirmação do pagamento. Cada volume tem até 5 liberações de download. Depois de baixar, guarde os arquivos no seu dispositivo para consulta off-line.",
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
