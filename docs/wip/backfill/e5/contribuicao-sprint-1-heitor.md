# Relatório Individual de Contribuição — Sprint 1 — Heitor Benedetti Lopes (RA 2840482421003)

**Papel nesta sprint:** Product Owner / Backend / Frontend elementar
**Período:** 15/09/2026 a 18/09/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | PR/commit | Status |
|---|---|---|
| Fundação do monorepo (`api` + `webapp`), licença e README inicial | `777cdff` | Mergeado |
| Rotas iniciais de login e configuração de ambiente | `a76561f` | Mergeado |
| Migração para SQLite e classe `Account` | `e105325` | Mergeado |
| Schema inicial e evolução da conta | `b767c86` | Mergeado |
| Geração de códigos OTC | `90e65b6` | Mergeado |
| Envio de e-mail via Resend e modo convidado | `e54b1da` | Mergeado |
| Markup, background, estilos, logo e fonte da tela de login | `81fa322`, `7259899`, `61496f7`, `08f2853`, `5118510` | Mergeado |
| Ajustes de README e licença | `0e237cb`, `1ca5320`, `b3afbed` | Mergeado |

## 2. Rituais que participei

- [x] Sprint Review interna (18/09)
- [x] Retrospectiva (18/09)
- [ ] Dailies formais — não houve registro de daily nesta sprint

## 3. PRs de colegas que revisei

Não há PR de outro integrante no período; todos os commits estão sob a mesma
identidade Git (`HLRangel`). O histórico não permite atribuir revisão cruzada.

## 4. Dificuldades e o que aprendi

A sprint foi curta e concentrou decisões estruturais (SQLite, OTC, monorepo).
A maior dificuldade foi conciliar a pressa com a qualidade: o login funcionou,
mas nenhum teste automatizado o cobria. Aprendi que a decisão por OTC foi
acertada para o escopo, mas que "funciona na minha máquina" não é evidência
suficiente para uma entrega avaliada.
