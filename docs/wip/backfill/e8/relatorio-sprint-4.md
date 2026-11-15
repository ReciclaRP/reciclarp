# Relatório de Entrega — Sprint 4 — ReciclaRP

**Entrega:** E8
**Período:** 19/10/2026 a 30/10/2026
**Sprint Review:** 30/10/2026, revisão interna da equipe; não há registro de
participação do professor.
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Planejado vs. entregue

| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #4 Consultar pontos no mapa | Sim | **Sim, parcialmente** | Mapa Leaflet, marcadores e popup conectados à API; sem geolocalização/ordenação por distância. |
| #5 Ver detalhes do ponto | Sim | **Sim, parcialmente** | Popup com horário, descrição e materiais; "Aberto" é fixo. |
| #6 Cadastrar ponto colaborativo | Sim | **Não** | Formulário só ganhou função real em 10/11; API de criação em 09/11. |
| #7 Aprovar/rejeitar | Sim | **Não** | Aprovação só em 13/11; rejeição nunca. |
| #8 Relatar problema | Sim | **Parcial** | Tela e endpoint criados; sem protocolo/status. |
| #10 Painel da ONG | Sim | **Não** | Tabela só em 04/11; aprovação em 13/11. |
| Deploy público | Sim (E8) | **Não** | Nenhuma URL publicada até 14/11. |

**Planejado:** 6 histórias + deploy. **Entregue:** 2 parciais, 2 não iniciadas,
2 avançadas em backend, deploy não realizado.

## 2. Incremento funcional demonstrável

O que era demonstrável ao fim da sprint:

- Mapa Leaflet/OpenStreetMap centrado em Ribeirão Preto, com marcadores apenas
  de pontos aprovados e popup por clique (`c862ee9`, `94cb493`, `8419190`,
  `036d027`, `9a174bb`, `25bf4e7`).
- Botão "Abrir no Maps" com link para Google Maps (`d21944b`).
- Login completo no webapp: pedido de código, troca por token, cookies
  `logintok`/`loginmail`, verificação em `/auth/check` e redirecionamento
  (`eab2bf5`, `e854f21`, `a76d08c`, `ecb2f32`, `8c04747`, `98a469e`).
- Página de relato pré-preenchida com os dados do ponto (`d0cb9b1`).
- API de relato (`8701ab5`, `d7ac2b5`), classe `Point` (`787db0b`) e correção
  do schema (`ed71828`).
- Invalidação de logins expirados (`5c85dfb`).
- Modo convidado com código OTC no log (`2ad4aff`) e proteção da instância
  Resend quando a chave não existe (`bf26c69`).

**Como reproduzir:** subir API e webapp; pedir código, entrar, abrir o mapa,
clicar em um ponto, abrir no Google Maps e enviar um relato. O portal da ONG
ainda não listava pontos.

**Commits principais:** `c862ee9`, `94cb493`, `8419190`, `036d027`, `9a174bb`,
`25bf4e7`, `d21944b`, `d0cb9b1`, `8701ab5`, `787db0b`, `ed71828`, `5c85dfb`,
`f4004f2`, `eab2bf5`, `e854f21`, `a76d08c`, `ecb2f32`, `8c04747`, `98a469e`.

## 3. Backlog atualizado

- #4 e #5 movidas para "Concluído com ressalvas" (mapa/popup funcionam; falta
  distância e "aberto agora").
- #6 e #7 permaneceram em "Em andamento".
- #8 movida para "Em andamento" (relato grava, mas sem protocolo).
- #10 permaneceu em "A fazer".
- Deploy permaneceu bloqueado; nenhuma tarefa de infraestrutura foi concluída.

## 4. Evidências de teste

- **API:** `api/tests/health.test.js` (6 testes de fumaça). Ainda sem testes de
  auth, pontos, acessos ou relatos.
- **Webapp:** nenhum teste de página; o teste de fumaça da Sprint 2 foi
  removido.
- **Manual:** mapa, popup, login e relato verificados em navegador; sem
  registro em vídeo/print no repositório.

Detalhe em [`evidencias-teste-sprint-4.md`](evidencias-teste-sprint-4.md).

## 5. Retrospectiva e contribuição individual

- Ata de retrospectiva: [`retrospectiva-sprint-4.md`](retrospectiva-sprint-4.md)
- Relatórios individuais:
  - [`contribuicao-sprint-4-heitor.md`](contribuicao-sprint-4-heitor.md)
  - [`contribuicao-sprint-4-adrian.md`](contribuicao-sprint-4-adrian.md)
  - [`contribuicao-sprint-4-victor.md`](contribuicao-sprint-4-victor.md)

## 6. Riscos e impedimentos para o fechamento

| Risco | Impacto | Ação |
|---|---|---|
| Portal da ONG e aprovação não entregues | O fluxo de moderação, requisito Must, não pode ser demonstrado | Abrir iteração de estabilização em 31/10. |
| Nenhum teste automatizado de comportamento | Impossível afirmar qualidade na E9 | Escrever suítes de API e webapp na estabilização. |
| Deploy não iniciado | Critério de MVP não atendido | Publicar ou declarar formalmente a pendência na E9/E10. |
| Criação de ponto não entregue | História #6 Must incompleta | Implementar API e tela na estabilização. |
| Segurança não auditada | Risco de bypass de autenticação | Auditoria e correção na estabilização (SEC-001/002/003). |

## 7. Parecer de encerramento da sprint

A Sprint 4 entregou a parte mais visível do produto (mapa, popup, login e
relato), mas **não entregou o MVP** definido na E2b: faltavam criação de ponto,
aprovação, painel da ONG, testes e deploy. O projeto precisou de uma iteração
extra de 31/10 a 14/11 para chegar ao estado atual. Essa iteração está
documentada em [`../pos-e8/relatorio-estabilizacao.md`](../pos-e8/relatorio-estabilizacao.md).
