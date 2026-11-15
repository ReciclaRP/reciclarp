# Ata de Retrospectiva — Sprint 1 — ReciclaRP

**Data:** 18/09/2026
**Presentes:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Reconstruída em:** 14/11/2026

## 1. Ações da retrospectiva anterior — foram aplicadas?

Não havia retrospectiva anterior (primeira sprint).

## 2. O que funcionou bem

- A decisão por **OTC** simplificou o escopo: um único fluxo cobre cadastro,
  login e recuperação, e elimina armazenamento de senha.
- O monorepo com `api` e `webapp` independentes permitiu trabalhar em paralelo
  sem acoplar build.
- A tela de login já nasceu com identidade visual própria (logo, fonte
  Atkinson Hyperlegible, background), o que ajudou na demonstração.
- O modo convidado da API (código no log) destravou o teste local sem depender
  de e-mail real.

## 3. O que não funcionou

- **Nenhum teste automatizado de autenticação.** O único teste era o de fumaça
  da API; o fluxo mais crítico ficou sem rede de proteção.
- A sprint foi comprimida em quatro dias úteis e o escopo planejado (três
  histórias) não caberia; #3 nem começou.
- O schema ainda estava em disputa entre PostgreSQL e SQLite, o que atrasou a
  modelagem de pontos.
- Não houve Sprint Review com o professor; a revisão foi interna.

## 4. Ações para a próxima sprint

| Ação | Responsável | Verificação na Sprint 2 |
|---|---|---|
| Fechar o schema SQLite (4 tabelas) e a seed | Adrian | `api/src/db/schema.js` com `user`, `point`, `report`, `access` |
| Configurar Vitest no webapp e CI no GitHub Actions | Victor | Commits `6764a77` e `f7b52c5` em 22/09 |
| Escrever testes de integração de auth | Heitor | **Não aplicada** — os testes só chegaram em 09/11 |
| Reduzir o escopo da Sprint 2 para layout + infraestrutura | Todos | Entregas de UI de 21–24/09 |
| Registrar a decisão por OTC no protótipo e no README | Heitor | `docs/prototipo.md` e README atualizados |

## 5. Comentário de encerramento

A sprint entregou a fundação e o login, mas não entregou o que o backlog
prometia. A lição registrada — "testar o fluxo de auth antes de avançar" — não
foi aplicada nas sprints seguintes e se tornou a maior dívida do projeto. A
correção só veio na iteração de estabilização, em 09–14/11.
