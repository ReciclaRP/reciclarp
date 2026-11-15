# Relatório Individual de Contribuição — Sprint 4 — Adrian Souza Teixeira (RA 2840482421051)

**Papel nesta sprint:** Responsável por dados (modelagem, banco)
**Período:** 19/10/2026 a 30/10/2026
**Reconstruído em:** 14/11/2026

## 1. O que fiz

| Item | Evidência | Status |
|---|---|---|
| Correção do schema para relato (`uid` no `report`) | `ed71828` | Mergeado (autoria Git: HLRangel) |
| Apoio à modelagem da classe `Point` | `787db0b` | **A confirmar** |
| Verificação da persistência do banco em arquivo | `recicladb.sqlite` | **A confirmar** |
| Início do plano de deploy | — | **Não realizado** |

> **Limitação de evidência:** não há commit assinado com o nome/RA de Adrian.
> A correção de schema e a classe `Point` estão sob `HLRangel`. A atribuição
> depende de evidência complementar.

## 2. Rituais que participei

- [x] Sprint Review interna (30/10)
- [x] Retrospectiva (30/10)
- [ ] Dailies formais — sem registro

## 3. PRs de colegas que revisei

Não há PR nominal de outro integrante no período. A revisão do schema de
relato deve ser comprovada por evidência externa ao Git.

## 4. Dificuldades e o que aprendi

O schema de relato precisou de ajuste porque o `uid` não estava previsto. A
lição é que a modelagem deve prever quem relatou e qual ponto, não só a
descrição. O deploy, que era minha responsabilidade declarada, não avançou —
e virou o principal bloqueio de aceite.
