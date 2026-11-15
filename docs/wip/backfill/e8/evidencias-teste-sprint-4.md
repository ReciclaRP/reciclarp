# Evidências de Teste — Sprint 4 — ReciclaRP

**Entrega:** E8
**Período:** 19/10/2026 a 30/10/2026
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Casos executados

| ID | Caso de teste | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT01/CT02 | Login OTC no navegador | Manual | **Passou no manual** | Fluxo de cookies e `/auth/check`; sem teste automatizado até 09/11. |
| CT24 | Cookies de login e redirecionamento | Manual | **Passou** | `eab2bf5`–`98a469e`; sem teste de UI. |
| CT25 | Mapa mostra apenas aprovados | Manual | **Passou** | Marcadores filtrados por `approved`; teste de UI só em 09/11. |
| CT26 | Popup com horário/materiais | Manual | **Passou com ressalva** | "Aberto" é fixo; não calcula horário atual. |
| CT17 | Relato persiste | Manual/API | **Passou** | `POST /report/create`; teste automatizado em 09/11. |
| CT07 | Cidadão cria ponto pendente | — | **Não executado** | API/tela não existiam. |
| CT10 | ONG aprova ponto | — | **Não executado** | Rota não existia. |
| CT29 | Portal da ONG | — | **Não executado** | Tabela vazia. |

## 2. Cobertura automatizada nesta sprint

- **API:** 6 testes de fumaça (`health.test.js`).
- **Webapp:** nenhum teste; o teste de fumaça anterior foi removido.
- **CI:** verde, mas sem cobrir os fluxos entregues.
- **Manual:** roteiro de mapa/popup/login/relato; sem prints ou vídeo
  versionados.

## 3. O que isso significa

A sprint entregou comportamento visível sem evidência automatizada. A rubrica
da E8 pede "casos de teste com resultado e evidência"; aqui a evidência é
manual e não versionada. A cobertura real só foi construída na iteração de
estabilização, e é ela que sustenta a E9.
