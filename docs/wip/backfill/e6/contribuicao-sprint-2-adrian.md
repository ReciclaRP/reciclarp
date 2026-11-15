# Relatório Individual de Contribuição — Sprint 2 — Adrian Souza Teixeira (RA 2840482421051)

**Papel nesta sprint:** Responsável por dados (modelagem, banco)
**Período:** 21/09/2026 a 02/10/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | Evidência | Status |
|---|---|---|
| Consolidação do schema SQLite (`user`, `point`, `report`, `access`) | `api/src/db/schema.js` | **A confirmar** |
| Rascunho da seed de pontos | `db/seed_draft.txt` | **A confirmar** |
| Revisão da modelagem após a mudança PostgreSQL → SQLite | `docs/der.md` (desatualizado) | **Pendente de revisão** |

> **Limitação de evidência:** não há commit assinado com o nome/RA de Adrian no
> histórico. O schema existe e está funcional, mas a atribuição depende de
> evidência complementar (ata, pair programming, print de revisão). A seed
> oficial só foi fechada na Sprint 3 (`a1622b2`, `4315891`).

## 2. Rituais que participei

- [x] Sprint Review interna (02/10)
- [x] Retrospectiva (02/10)
- [ ] Dailies formais — sem registro

## 3. PRs de colegas que revisei

Não há PR nominal de outro integrante no período. A revisão do schema e da seed
deve ser comprovada por evidência externa ao Git.

## 4. Dificuldades e o que aprendi

O schema fechou, mas a seed não acompanhou, e o mapa ficou sem dados. Aprendi
que "modelo pronto" não é "dados prontos": a massa de teste é parte da entrega
e precisa entrar na mesma sprint do modelo.
