# Relatório Individual de Contribuição — Sprint 1 — Adrian Souza Teixeira (RA 2840482421051)

**Papel nesta sprint:** Responsável por dados (modelagem, banco, PostGIS)
**Período:** 15/09/2026 a 18/09/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | Evidência | Status |
|---|---|---|
| Modelagem conceitual e DER | `docs/der.md` (04/09/2026) | Entregue antes da sprint |
| Diagrama de classes e casos de uso | `docs/uml.md` (04/09/2026) | Entregue antes da sprint |
| Participação na decisão PostgreSQL → SQLite | `e105325` (17/09) | **A confirmar em ata** |
| Revisão do schema de pontos e materiais | `api/src/db/schema.js` | **A confirmar** |

> **Limitação de evidência:** não há commit assinado com o nome/RA de Adrian no
> histórico do repositório. O histórico é de autoria única (`HLRangel`), o que
> não prova ausência de trabalho, mas impede que este relatório cite commits
> específicos. A evidência complementar (pair programming, ata, print, PR em
> fork, mensagem de revisão) deve ser anexada pelo integrante ou pelo PO.

## 2. Rituais que participei

- [x] Sprint Review interna (18/09)
- [x] Retrospectiva (18/09)
- [ ] Dailies formais — não houve registro

## 3. PRs de colegas que revisei

Não há PR de outro integrante no período. A revisão do DER/UML e da decisão de
banco deve ser comprovada por evidência externa ao Git.

## 4. Dificuldades e o que aprendi

A maior dificuldade foi a mudança de SGBD no meio da sprint: o DER da E3 foi
feito para PostgreSQL/PostGIS e precisou ser reinterpretado em SQLite. Aprendi
que a modelagem precisa acompanhar a decisão de infraestrutura, e que registrar
a decisão em ata evita que o relatório individual dependa só de memória.
