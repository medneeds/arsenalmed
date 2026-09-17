# Área do comprador com e-mail e senha

Hoje o acesso aos PDFs depende do link com token enviado por e-mail. A ideia é criar uma área de acesso onde o comprador entra com e-mail e senha e encontra os dois volumes para baixar.

## Como funciona para o comprador

1. **Primeiro acesso** (`/entrar`, aba "Criar acesso"): a pessoa informa o e-mail usado na compra e escolhe uma senha. O sistema só cria a conta se existir uma compra paga do Arsenal Med com aquele e-mail. Se não existir, mostra uma mensagem orientando a escrever para suporte@arsenalmed.com.br.
2. **Acessos seguintes** (`/entrar`): e-mail + senha.
3. **Minha conta** (`/minha-conta`): mostra os dois volumes (Manual Completo e Catálogo), data da compra, prazo de validade, downloads restantes, e o botão de baixar — o mesmo comportamento da página atual, mas sem precisar do link do e-mail.
4. **Esqueci a senha**: envio de link de redefinição por e-mail, com a página `/nova-senha` para escolher a nova senha.

O link com token continua funcionando normalmente, para quem já comprou e usa o e-mail antigo. Os e-mails de compra passam a citar as duas formas: o link direto e o acesso por e-mail e senha.

## Regras de segurança

- Nenhum cadastro aberto: a conta só nasce se houver compra paga confirmada com aquele e-mail. A verificação acontece no servidor.
- Os limites atuais continuam valendo: 7 dias de validade e 5 downloads por volume, contados por compra, não por login.
- O painel administrativo continua restrito a arturaugustosb@gmail.com. Uma conta de comprador nunca entra no painel: quem faz login é levado para "Minha conta", e o painel permanece com a verificação de administrador.
- Nenhuma página pública passa a expor e-mail, CPF ou token.

## Visual

A página de acesso e a área do comprador seguem a identidade atual: fundo papel, cabeçalho musgo, cantos retos, tipografia Archivo Narrow / Source Serif / IBM Plex Mono. Sem novas cores nem novos componentes visuais — reuso do cabeçalho, do brasão e dos cartões de download já existentes.

## Detalhes técnicos

- Nova rota pública `/entrar` (login + criação de acesso) e `/nova-senha` (recuperação).
- Nova rota protegida `src/routes/_authenticated/minha-conta.tsx`.
- Server function `criarAcessoComprador` (admin client): busca em `compras` por `email` com `status = 'pago'`; se houver, cria o usuário já confirmado e vincula `user_id` na(s) compra(s) daquele e-mail.
- Migração: coluna `user_id` em `compras` + política RLS de leitura própria (`auth.uid() = user_id`), sem acesso anônimo.
- `/api/public/download` ganha um caminho autenticado: aceita token (como hoje) **ou** sessão válida + `compra_id` pertencente ao usuário. Contadores e expiração inalterados.
- `enable_email_auth` para habilitar login por senha; cadastro público continua desligado (contas criadas só via server function).
- `/auth` (admin) permanece como está; o login do comprador é separado em `/entrar`.
