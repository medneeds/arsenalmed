import { TopoLines } from "./TopoLines";

export function Problema() {
  return (
    <section className="relative overflow-hidden bg-papel px-4 py-20 md:px-6 md:py-28">
      <TopoLines />
      <div className="relative mx-auto max-w-[680px]">
        <p className="fieldtag">O PROBLEMA</p>
        <h2 className="mt-5 text-tinta">Você não esqueceu a conduta. Você não tem tempo de organizá-la.</h2>
        <div className="mt-8 space-y-6 text-tinta">
          <p>
            Todo guia de prescrição é organizado do jeito que a farmacologia é ensinada: por classe e por
            via de administração. Anti-hipertensivos juntos. Endovenosos juntos. Faz sentido na prova.
          </p>
          <p>
            Não faz sentido no plantão. Às três da manhã, diante do paciente grave — ou potencialmente grave —
            ninguém procura "antiarrítmico". Procura-se o que fazer com a taquicardia instável que está no
            monitor agora, e em que ordem.
          </p>
          <p>
            O Arsenal inverte a entrada. Primeiro o cenário, depois o fármaco. E cada cenário cabe em uma tela: o
            que reconhecer, o que fazer nos primeiros minutos, a prescrição pronta, as armadilhas e o
            critério para chamar ajuda.
          </p>
        </div>
      </div>
    </section>
  );
}
