# Relatório Individual de Contribuição — Sprint 1 — Victor Breno Anastácio de Matos (RA 2840482313038)

**Papel nesta sprint:** Responsável por qualidade (frontend, testes)
**Período:** 15/09/2026 a 18/09/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | Evidência | Status |
|---|---|---|
| Revisão de usabilidade da tela de login | Commits `5118510` e `0e237cb` (ajustes de fonte/estilos) | **A confirmar** |
| Preparação da estratégia de testes | `docs/plano-de-testes.md` (11/09/2026) | Entregue antes da sprint |
| Configuração de Vitest e CI | `6764a77` e `f7b52c5` (22/09) | Entregue na Sprint 2, fora desta janela |

> **Limitação de evidência:** não há commit assinado com o nome/RA de Victor no
> histórico do repositório. O histórico é de autoria única (`HLRangel`).
> A configuração de Vitest/CI aparece em 22/09, já na Sprint 2. A contribuição
> desta sprint precisa de evidência complementar (pair programming, ata,
> print, revisão de PR) para ser pontuada.

## 2. Rituais que participei

- [x] Sprint Review interna (18/09)
- [x] Retrospectiva (18/09)
- [ ] Dailies formais — não houve registro

## 3. PRs de colegas que revisei

Não há PR de outro integrante no período. A revisão da tela de login e do
plano de testes deve ser comprovada por evidência externa ao Git.

## 4. Dificuldades e o que aprendi

O plano de testes previa integração com PostgreSQL e recuperação de senha;
ambos mudaram antes da primeira linha de teste. Aprendi que o plano precisa
ser revisado quando a arquitetura muda, e que a suíte só vira evidência quando
é executada no CI — o que aconteceu na sprint seguinte.
