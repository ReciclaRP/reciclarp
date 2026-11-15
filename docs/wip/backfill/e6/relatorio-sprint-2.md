# Relatório de Entrega — Sprint 2 — ReciclaRP

**Entrega:** E6
**Período:** 21/09/2026 a 02/10/2026
**Sprint Review:** 02/10/2026, revisão interna da equipe; não há registro de
participação do professor.
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Planejado vs. entregue

| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #4 Consultar pontos no mapa | Sim | **Parcial (só layout)** | `map.html` e menu criados em 21/09, mas sem Leaflet, sem API e sem marcadores. |
| #5 Ver detalhes do ponto | Sim | **Parcial (só layout)** | Popup desenhado; sem dados reais e sem cálculo de "aberto agora". |
| #6 Cadastrar ponto colaborativo | Sim | **Parcial (só formulário)** | `user-suggest.html`/`point-create` inicial apenas coleta e imprime dados no console; a API de criação só veio em 09/11. |
| #8 Relatar problema | Antecipada | **Parcial (só layout)** | Tela `user-report.html` criada em 22–24/09; endpoint em 28/10. |
| #3 ONG cadastra pontos | Pendente da Sprint 1 | **Não** | Continua sem fluxo funcional. |

**Planejado:** 3 histórias Must. **Entregue:** 3 parciais em nível de interface,
0 funcionais de ponta a ponta.

## 2. Incremento funcional demonstrável

O que era demonstrável ao fim da sprint:

- Navegação entre login, menu, mapa, relato, sugestão de ponto e portal da ONG.
- Layout responsivo inicial com CSS externo (`general.css`, `topapp.css`,
  `mappage.css`), ícones e top bar.
- Vitest instalado no `webapp` (`6764a77`) e workflow de CI no GitHub Actions
  (`f7b52c5`) rodando as duas suítes.
- Schema SQLite com quatro tabelas e classes `Account`/`Tickets`/`Tokens`.
- Seed ainda em rascunho; o mapa não consumia a API.

**Como reproduzir:** subir `api` e `webapp`; navegar pelas páginas. O mapa
mostrava apenas o contêiner vazio; o formulário de sugestão não criava ponto.

**Commits principais:** `0ba20af` (menus), `63ca24b`/`12e9c5f` (sugestão e
relato), `f538a84` (tela de relato), `00681dc` (CSS externo), `4515273`
(portal da ONG e criação de ponto), `6764a77` (Vitest), `f7b52c5` (CI),
`24dee85` (merge da `semana/2`).

## 3. Backlog atualizado

- #4, #5 e #6 movidas para "Em andamento (interface)".
- #8 antecipada para "Em andamento".
- #3 permaneceu em "A fazer".
- Criadas tarefas técnicas: "conectar mapa à API", "implementar criação de
  ponto", "implementar aprovação", "escrever testes de API".

## 4. Evidências de teste

- **API:** `api/tests/health.test.js` (6 testes de fumaça). Nenhum teste de
  auth, ponto ou relato.
- **Webapp:** Vitest configurado com um teste de fumaça de 5 linhas em
  `webapp/src/main.test.js` (commit `6764a77`), removido na reorganização
  posterior. Não havia teste de página.
- **CI:** workflow criado e verde, mas cobrindo apenas o teste de fumaça.

Detalhe em [`evidencias-teste-sprint-2.md`](evidencias-teste-sprint-2.md).

## 5. Retrospectiva e contribuição individual

- Ata de retrospectiva: [`retrospectiva-sprint-2.md`](retrospectiva-sprint-2.md)
- Relatórios individuais:
  - [`contribuicao-sprint-2-heitor.md`](contribuicao-sprint-2-heitor.md)
  - [`contribuicao-sprint-2-adrian.md`](contribuicao-sprint-2-adrian.md)
  - [`contribuicao-sprint-2-victor.md`](contribuicao-sprint-2-victor.md)

## 6. Riscos e impedimentos para a próxima sprint

| Risco | Impacto | Ação |
|---|---|---|
| Interface pronta sem backend | Demonstração vazia; retrabalho de integração | Priorizar endpoints e conexão do mapa na Sprint 3. |
| Nenhum teste funcional | Regressão silenciosa | Escrever testes de API antes de novas telas. |
| Seed ainda em rascunho | Mapa sem dados | Fechar a seed com os oito ecopontos na Sprint 3. |
| Mudança de PostgreSQL para SQLite | DER e plano de testes desatualizados | Revisar documentos na E7/E9. |
