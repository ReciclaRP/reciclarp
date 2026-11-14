# Relatório de Entrega — Sprint 1 — ReciclaRP

**Entrega:** E5
**Período:** 15/09/2026 a 18/09/2026 (Sprint 1 comprimida em uma semana)
**Sprint Review:** 18/09/2026, revisão interna da equipe; não há registro de
participação do professor.
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Planejado vs. entregue

| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #1 Criar conta e acessar | Sim | **Parcial** | Backend de OTC, criação automática de conta e tela de login prontos. A troca de código por token ainda não estava coberta por teste automatizado. |
| #2 Recuperar senha | Sim | **Substituída** | A decisão por OTC elimina a recuperação separada; o fluxo de código cobre o caso. |
| #3 ONG cadastra pontos iniciais | Sim | **Não** | Ficou para a Sprint 2/3; o schema e a seed ainda estavam em definição. |

**Planejado:** 3 histórias. **Entregue:** 1 parcial, 1 substituída por design,
1 não iniciada. A sprint foi comprimida e o foco real foi a fundação técnica e
o login.

## 2. Incremento funcional demonstrável

O que estava rodando ao fim da sprint:

- API Express com `POST /auth/login`, geração de código OTC de seis dígitos e
  envio por Resend (ou impressão no log, sem chave).
- Classe `Account` sobre SQLite, com criação automática de conta para e-mail
  válido e controle de `banned`/`ong`.
- Tela de login em `index.html`, com campo de e-mail, campo de código, botão
  "Pedir Código", estilos, logo e fonte.
- Base do repositório: Vite no `webapp`, Express no `api`, licença AGPL-3.0,
  `README.md` inicial e teste de fumaça da API.

**Como reproduzir:** `cd api && npm run dev`; `cd webapp && npm run dev`;
abrir `http://localhost:5173`, pedir código, ler o código no log da API e
entrar. O redirecionamento ao mapa ainda não existia de forma completa.

**Commits principais:** `777cdff` (fundação), `a76561f` (rotas de login),
`e105325` (SQLite + `Account`), `b767c86` (schema/conta), `90e65b6` (OTC),
`e54b1da` (e-mail), `81fa322`/`61496f7`/`08f2853`/`5118510` (tela e estilos),
`0e237cb` (README).

## 3. Backlog atualizado

- #1 movida de "A fazer" para "Em andamento": backend e tela prontos, falta
  teste e integração com o mapa.
- #2 encerrada como "Substituída por OTC" e registrada no protótipo.
- #3 permaneceu em "A fazer".
- Novas tarefas técnicas criadas: "definir schema SQLite", "configurar CI",
  "criar testes de autenticação".

O board oficial é o GitHub Projects da organização:
https://github.com/orgs/ReciclaRP/projects/1/views/1. Não há exportação
histórica do board nesta data; o registro acima é reconstruído pelos commits.

## 4. Evidências de teste

- **API:** `api/tests/health.test.js` (6 testes hoje) era o único arquivo de
  teste no período; os testes de autenticação só foram adicionados em
  09/11/2026. Portanto, **não há evidência automatizada de login nesta sprint**.
- **Webapp:** o Vitest foi instalado apenas em 22/09 (`6764a77`), depois desta
  sprint; não havia teste de UI.
- **Manual:** login por OTC executado em modo convidado, com código lido no log.

Detalhe em [`evidencias-teste-sprint-1.md`](evidencias-teste-sprint-1.md).

## 5. Retrospectiva e contribuição individual

- Ata de retrospectiva: [`retrospectiva-sprint-1.md`](retrospectiva-sprint-1.md)
- Relatórios individuais:
  - [`contribuicao-sprint-1-heitor.md`](contribuicao-sprint-1-heitor.md)
  - [`contribuicao-sprint-1-adrian.md`](contribuicao-sprint-1-adrian.md)
  - [`contribuicao-sprint-1-victor.md`](contribuicao-sprint-1-victor.md)

## 6. Riscos e impedimentos para a próxima sprint

| Risco | Impacto | Ação |
|---|---|---|
| Nenhum teste cobre autenticação | Regressão silenciosa no fluxo mais crítico | Criar testes de integração de auth na Sprint 2 (não foi feito; virou dívida até 09/11). |
| Schema ainda em definição | Retrabalho no backend | Fechar o schema SQLite na Sprint 2. |
| Sprint comprimida | Pouco tempo para revisão | Reduzir escopo da Sprint 2 para layout + infraestrutura. |
| Dependência de Resend | Sem chave, o fluxo depende do log | Manter modo convidado documentado e testável. |
