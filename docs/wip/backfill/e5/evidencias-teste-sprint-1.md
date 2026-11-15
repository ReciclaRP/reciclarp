# Evidências de Teste — Sprint 1 — ReciclaRP

**Entrega:** E5
**Período:** 15/09/2026 a 18/09/2026
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Casos executados

| ID | Caso de teste | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT01 | Login cria conta e envia OTC | Manual / API | **Passou no manual; sem teste automatizado** | Execução em modo convidado; código no log da API. Teste automatizado só em `api/tests/auth.test.js` (09/11/2026). |
| CT02 | Troca de OTC válido/inválido | Manual / API | **Parcial** | Troca válida verificada manualmente; não havia teste para código incorreto, expirado ou replay. |
| CT03 | Conta banida não loga | — | **Não executado** | Recurso existia no código, sem teste. |
| CT04 | Logout invalida sessão | — | **Não executado** | Rota `/auth/logout` ainda não existia nesta sprint. |
| CT08 | ONG cria ponto aprovado | — | **Não iniciado** | História #3 não entrou na sprint. |

## 2. Cobertura automatizada nesta sprint

- **API:** 1 arquivo, `api/tests/health.test.js`, com 6 testes de fumaça
  (seed, `/point/list`, `/api/ping`, `X-Powered-By`, CORS, 404). Nenhum cobre
  autenticação.
- **Webapp:** nenhum teste. O Vitest foi adicionado em 22/09.
- **CI:** ainda não existia; o workflow foi criado em 22/09 (`f7b52c5`).

## 3. O que isso significa

A sprint não produziu evidência automatizada do incremento que realmente
entregou (login). A evidência é manual e reproduzível, mas não é suficiente
para a rubrica "Excelente" da E5. O registro correto é **dívida de teste**, não
cobertura. A suíte de auth só foi escrita na iteração de estabilização
(09/11/2026) e é a que hoje cobre CT01–CT04.
