# Relatório de Entrega — Sprint 3 — ReciclaRP

**Entrega:** E7
**Período:** 05/10/2026 a 16/10/2026
**Sprint Review:** 16/10/2026, revisão interna da equipe; não há registro de
participação do professor.
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Planejado vs. entregue

| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #3 ONG cadastra pontos iniciais | Sim (pendente da Sprint 1) | **Parcial** | Seed com oito ecopontos e conta admin `ong = 1`; o formulário de criação ainda não chamava a API. |
| #4 Consultar mapa | Sim | **Parcial** | `POST /point/list` e dados no banco; o webapp ainda não consumia a API. |
| #7 Aprovar/rejeitar requisições | Sim | **Não** | Nenhuma rota de aprovação; entrou em 13/11. |
| #6 Cadastrar ponto colaborativo | Pendente | **Parcial** | Leitura de formulário e schema; criação real em 09/11. |

## 2. Incremento funcional demonstrável

O que era demonstrável ao fim da sprint:

- Schema de pontos fechado, com descrição, coordenadas, horário e quatro flags
  de material (`a689ef9`, `db3753c`, `76541f9`).
- Seed com os oito ecopontos reais de Ribeirão Preto (`__RECICLA_POINT_SEED`),
  administrador `ong = 1` e script de boot que cria o banco na primeira
  execução (`a1622b2`, `4315891`).
- Sistema de login da API refinado (`2334bdf`), leitura de formulário
  (`933b2d9`) e correções de sintaxe/rota (`4dc35d9`).
- CLI interativo para chamar a API (`07ab6d9`, `51a00d2`), útil para testar
  login e listagem sem o webapp.
- Referência de schema atualizada (`7147c62`).

**Como reproduzir:** apagar `api/recicladb.sqlite`, subir a API — o banco é
criado e semeado; usar o CLI para fazer login e listar pontos; conferir os oito
ecopontos no banco. O mapa do webapp ainda não os exibia.

**Commits principais:** `933b2d9`, `2334bdf`, `07ab6d9`, `51a00d2`, `a689ef9`,
`db3753c`, `76541f9`, `8c6b463`, `a1622b2`, `4315891`, `4dc35d9`, `ccac1e9`
(merge da `semana/3`).

## 3. Backlog atualizado

- #3 movida para "Em andamento": dados e conta ONG prontos, falta o fluxo de
  criação pela interface.
- #4 movida para "Em andamento": API e seed prontos, falta conectar o mapa.
- #7 permaneceu em "A fazer".
- Criadas tarefas: "conectar frontend à API", "implementar aprovação",
  "escrever testes de integração".

## 4. Evidências de teste

- **API:** `api/tests/health.test.js` (6 testes de fumaça), incluindo seed e
  `/point/list`. Nenhum teste de login, criação ou aprovação.
- **CLI:** verificação manual de login e listagem.
- **Webapp:** nenhum teste de página; o teste de fumaça da Sprint 2 foi
  removido na reorganização.

Detalhe em [`evidencias-teste-sprint-3.md`](evidencias-teste-sprint-3.md).

## 5. Retrospectiva e contribuição individual

- Ata de retrospectiva: [`retrospectiva-sprint-3.md`](retrospectiva-sprint-3.md)
- Relatórios individuais:
  - [`contribuicao-sprint-3-heitor.md`](contribuicao-sprint-3-heitor.md)
  - [`contribuicao-sprint-3-adrian.md`](contribuicao-sprint-3-adrian.md)
  - [`contribuicao-sprint-3-victor.md`](contribuicao-sprint-3-victor.md)

## 6. Riscos e impedimentos para a próxima sprint

| Risco | Impacto | Ação |
|---|---|---|
| Mapa ainda desconectado | A história #4 não pode ser demonstrada | Conectar `pullMapData` e Leaflet no início da Sprint 4. |
| Nenhuma rota de aprovação | Fluxo de moderação incompleto | Implementar `/point/approve` e a tabela da ONG. |
| Nenhum teste de API | Regressão silenciosa | Escrever suítes de auth/pontos (não foi feito até 09/11). |
| DER/plano desatualizados | Documentação divergente | Revisar na E9/E10. |
