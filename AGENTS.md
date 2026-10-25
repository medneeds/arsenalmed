<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- MedStation annual-plan bonus enters via POST /api/public/medstation-bonus: the reference is confirmed against MedStation's public verify endpoint (no shared secret), stored in `compras` with `origem = 'medstation_bonus'`, `valor_centavos = 0`, `stripe_session_id = 'medstation:' + reference`; renewals only extend `expira_em`. Why: auditability without sharing secrets between projects.
- Bonus rows are not sales: admin revenue, ticket and funnel metrics exclude `origem = 'medstation_bonus'`. Why: zero-value rows would distort sales figures.
- Personalized PDFs are never generated at bonus registration; they are generated on first download and require a valid CPF on the purchase (collected at "Criar acesso" when missing). Why: delivery must always carry the buyer's identification.
- Pure business rules live in small modules with vitest tests (`bunx vitest run`, config in vitest.config.ts). Why: the app's Vite config is not suitable for tests.
