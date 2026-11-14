# Evidências de Teste — Sprint 2 — ReciclaRP

**Entrega:** E6
**Período:** 21/09/2026 a 02/10/2026
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Casos executados

| ID | Caso de teste | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT25 | Mapa mostra apenas pontos aprovados | Manual | **Não executado (sem mapa funcional)** | `map.html` era apenas contêiner; Leaflet entrou em 27/10. |
| CT26 | Popup descreve materiais | Manual | **Não executado (sem dados)** | Popup era markup estático. |
| CT27 | Formulário de criação envia campos | Manual | **Parcial** | O script de sugestão apenas imprimia os dados no console; a API de criação só veio em 09/11. |
| CT24 | Login no webapp grava cookies | Manual | **Não executado** | A lógica de cookies ainda não existia; `src/logic/login.js` foi criado em 26/10. |
| CT29 | Portal da ONG lista pontos | Manual | **Não executado** | Tabela sem dados; lógica em 04/11. |

## 2. Cobertura automatizada nesta sprint

- **API:** `api/tests/health.test.js` — 6 testes de fumaça; nenhum cobre auth,
  pontos ou relatos.
- **Webapp:** Vitest configurado em `6764a77`, com um teste de fumaça de cinco
  linhas em `webapp/src/main.test.js`. O arquivo foi removido na reorganização
  posterior; não há teste de página nesta data.
- **CI:** workflow em `.github/workflows/main.yml` executando `npm test` nos
  dois projetos. Verde, mas cobrindo apenas os testes de fumaça.

## 3. O que isso significa

A sprint entregou infraestrutura de teste, não cobertura de comportamento. A
rubrica da E6 pede casos de teste com evidência de execução; nesta sprint, a
evidência é de **build e fumaça**, não de fluxo. O registro correto é dívida de
teste, quitada apenas na iteração de estabilização (09–14/11/2026).
