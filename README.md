# Arsenalmed

Crie uma landing page de página única em React com Vite, TypeScript, Tailwind CSS e

shadcn/ui, para venda de um produto digital brasileiro. Mobile-first: a maior parte

do público abre no celular, em pé, em intervalo de trabalho.

NESTE PRIMEIRO PASSO, construa APENAS a fundação visual e um hero placeholder.

Não construa as outras seções ainda.

== TOKENS DE COR ==

Configure no tailwind.config e como CSS variables. Nomes exatos:

musgo-900: #1B2418

musgo-800: #28331F

musgo-700: #3B4A2C

musgo-600: #4E6139

musgo-500: #657A49

musgo-300: #A8B78C

musgo-150: #D4DCC3

musgo-100: #E4E9D8

papel:     #F5F2E6

papel-2:   #EDEAD9

ferrugem:  #A0522D

ocre:      #B08A3E

tinta:     #222A1C

Regras de uso:

- Fundo padrão da página: papel (#F5F2E6). Nunca branco puro.

- Texto corrido: tinta (#222A1C).

- Seções de destaque e rodapé: fundo musgo-800 com texto papel.

- ocre é a cor de ação: botões primários e detalhes. Use com parcimônia.

- ferrugem é a cor de alerta e de ênfase clínica. Nunca em botão de compra.

== TIPOGRAFIA ==

Importe do Google Fonts:

- Archivo Narrow (400, 600, 700) → títulos, rótulos, botões, navegação.

  Sempre em MAIÚSCULAS com letter-spacing entre 0.06em e 0.26em nos rótulos pequenos.

- Source Serif 4 (400, 600) → todo o texto corrido. É a fonte de leitura.

- IBM Plex Mono (400, 600) → blocos de prescrição, números, doses, preço.

Escala mobile: h1 32px / h2 24px / h3 18px / corpo 17px / rótulo 12px.

Escala desktop: h1 56px / h2 36px / h3 22px / corpo 18px / rótulo 13px.

Altura de linha do corpo: 1.6. O produto é sobre legibilidade — não aperte o texto.

== ESTILO ==

Estética de manual técnico impresso, anos 60, com um traço militar discreto.

- Cantos retos ou raio máximo de 2px. Nada arredondado.

- Sem sombras difusas. Se precisar de profundidade, use borda de 1px em musgo-300.

- Sem gradientes.

- Divisórias: linha de 1px em musgo-300, ou linha dupla fina.

- Ilustrações: exclusivamente SVG inline, traço de 3 a 4px, paleta acima, estilo

  minimalista geométrico. PROIBIDO usar fotografia, banco de imagens ou imagem

  gerada por IA.

== LOGO ==

Crie como componente SVG inline reutilizável. Emblema em formato de escudo

(brasão), contorno em musgo-500, com dois galões em ocre empilhados na parte

superior e uma cruz médica sólida em musgo-100 na parte inferior. Ao lado,

a palavra ARSENAL em Archivo Narrow bold com letter-spacing 0.14em, e abaixo

MED em corpo menor, letter-spacing 0.5em, cor musgo-500.

A referência militar deve ser sugerida, nunca literal: sem armas, sem camuflagem,

sem caveiras.

== NAVEGAÇÃO ==

Header fixo, fundo papel com 92% de opacidade e blur leve, borda inferior de 1px

em musgo-300, altura 64px.

Esquerda: logo. Direita: botão "R$ 69,90 — Comprar" em fundo ocre, texto musgo-900,

Archivo Narrow bold maiúsculas.

No mobile o botão encolhe para "Comprar R$ 69,90" sem menu hambúrguer — não há

outros itens de menu.

== HERO PLACEHOLDER ==

Só por enquanto: fundo musgo-800, altura 70vh, logo centralizado grande e o texto

"Hero em construção". Vou substituir no próximo passo.

Não crie backend, banco de dados nem integração de pagamento neste passo.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://arsenalmed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/703af14d-60a0-47a7-a93b-d7422ff663cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
