# Evidências de Teste — Sprint 3 — ReciclaRP

**Entrega:** E7
**Período:** 05/10/2026 a 16/10/2026
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Casos executados

| ID | Caso de teste | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT07 | Cidadão cria ponto pendente | Manual/CLI | **Parcial** | Leitura de formulário e schema prontos; criação só em 09/11. |
| CT08 | ONG cria ponto aprovado | Manual/CLI | **Parcial** | Conta admin `ong = 1` e seed prontos; formulário não chamava a API. |
| CT23 | Schema e seed | Automatizado (fumaça) | **Passou** | `api/tests/health.test.js` valida seed e `/point/list`. |
| CT10 | ONG aprova ponto | — | **Não executado** | Rota não existia. |
| CT25 | Mapa mostra aprovados | — | **Não executado** | Mapa sem Leaflet/dados. |
| CT22 | Persistência após restart | Manual | **Parcial** | Banco em arquivo; sem teste automatizado até 14/11. |

## 2. Cobertura automatizada nesta sprint

- **API:** 6 testes de fumaça em `health.test.js`; o teste de seed valida os
  oito ecopontos e a conta admin.
- **Webapp:** nenhum teste de página.
- **CLI:** roteiro manual: subir API, pedir código, trocar por token, listar
  pontos.
- **CI:** executa as duas suítes; a do webapp passa sem testes.

## 3. O que isso significa

A sprint tem evidência de **dados e boot**, não de fluxo de usuário. O caso
CT23 é o único com cobertura real. O fluxo de criação/aprovação só ganhou
teste na iteração de estabilização; a evidência manual via CLI não substitui
um teste de integração.
