# Relatório Individual de Contribuição — Sprint 3 — Adrian Souza Teixeira (RA 2840482421051)

**Papel nesta sprint:** Responsável por dados (modelagem, banco)
**Período:** 05/10/2026 a 16/10/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | Evidência | Status |
|---|---|---|
| Modelagem final da tabela `point` (flags, horário, coordenadas) | `api/src/db/schema.js` | **A confirmar** |
| Seed dos oito ecopontos reais | `api/src/db/schema.js`, `db/seed_draft.txt` | **A confirmar** (commits `a1622b2`, `4315891`) |
| Validação de coordenadas e horários | Ainda não implementada | **Pendente (SEC-007)** |
| Revisão do DER para SQLite | `docs/der.md` | **Não aplicada** — documento ainda em PostgreSQL |

> **Limitação de evidência:** não há commit assinado com o nome/RA de Adrian.
> A seed e o schema estão no histórico sob `HLRangel`. A atribuição depende de
> evidência complementar.

## 2. Rituais que participei

- [x] Sprint Review interna (16/10)
- [x] Retrospectiva (16/10)
- [ ] Dailies formais — sem registro

## 3. PRs de colegas que revisei

Não há PR nominal de outro integrante no período. A revisão da seed e do
schema deve ser comprovada por evidência externa ao Git.

## 4. Dificuldades e o que aprendi

A seed ficou boa, mas o DER continuou desatualizado em relação ao SQLite. A
lição é que o documento de modelagem precisa ser atualizado na mesma PR que
muda o schema; caso contrário, a banca vê duas verdades diferentes.
