# Relatório de Testes Executados — ReciclaRP

**Entrega:** E9a
**Data da bateria final:** 14/11/2026
**Data oficial da E9:** 06/11/2026 (a bateria foi concluída depois; registro
reconstruído em 14/11/2026)
**Escopo testado:** histórias Must + Should do Termo de Aceite do Projeto
(E2b), no estado congelado da branch `semana/7` (commit `ca01c0c`)
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Casos de teste planejados (CT01–CT33 da E4b) | 33 |
| Casos conformes (`Passou`) | 27 |
| Casos com ressalva (CT06, CT16, CT26) | 3 |
| Casos parciais (CT27, CT32, CT33) | 3 |
| Itens do escopo sem caso de teste (rejeição, protocolo, CSV, dicas) | 4 |
| Testes automatizados totais | 222 |
| Testes que passam | 208 |
| Testes pulados (`skip`) | 12, todos de segurança declarada |
| Testes `todo` | 2, ambos de defeitos de UI declarados |
| Testes que falham | **0** |
| Cobertura de linhas/branches | não medida (sem `c8`/`istanbul`) |
| Deploy público testado | **não** — nenhuma URL de produção existe |

**Leitura:** a suíte ativa está verde, mas verde não significa escopo completo.
Três casos passam com ressalva (CT06, CT16 e CT26), três são parciais (CT27,
CT32 e CT33) e quatro itens do escopo aceito não têm sequer caso de teste porque
a funcionalidade não existe (rejeição, protocolo, CSV e dicas). Os 12 `skip` são
falhas de segurança conhecidas, não testes esquecidos.

## 2. Casos de teste — visão consolidada

| ID | Área | Tipo | Resultado | Observação |
|---|---|---|---|---|
| CT01 | Login OTC / criação de conta | Integração | **Passou** | `api/tests/auth.test.js` |
| CT02 | Troca de OTC válido/inválido/replay | Integração + segurança | **Passou** | `auth.test.js`, `security.regression.test.js` |
| CT03 | Conta banida | Integração | **Passou** | `auth.test.js` |
| CT04 | Logout | Integração | **Passou** | `auth.test.js` |
| CT05 | Deleção anonimiza a conta | Integração | **Passou** | `auth-delete.test.js` |
| CT06 | Listagem pública de pontos | Integração | **Passou com ressalva** | Retorna todos os pontos; SEC-004 aberto |
| CT07 | Cidadão cria ponto pendente | Integração | **Passou** | `points.test.js` |
| CT08 | ONG cria ponto aprovado | Integração | **Passou** | `points.test.js` |
| CT09 | Normalização de materiais | Integração | **Passou** | `points.test.js`; defeito do checkbox biológico é de UI |
| CT10 | Aprovação pela ONG | Integração | **Passou** | `points.test.js` |
| CT11 | Não-ONG não modera | Segurança | **Passou** | `security.regression.test.js` |
| CT12 | Edição pela ONG (API) | Integração | **Passou** | `points.test.js`; sem tela |
| CT13 | Remoção pela ONG | Integração | **Passou** | `points.test.js` |
| CT14 | Registro de acesso | Integração | **Passou** | `access.test.js` |
| CT15 | Contagem restrita à ONG | Integração/segurança | **Passou** | `access.test.js` |
| CT16 | Dados do gráfico por hora | Integração + UI | **Passou com ressalva** | `access.test.js`, `ong-menu-page.test.js`; rótulos 18h/22h ausentes |
| CT17 | Relato persiste | Integração | **Passou** | `reports.test.js` |
| CT18 | Relato inválido | Integração | **Passou** | `reports.test.js` |
| CT19 | Categorias do relato | Integração | **Passou** | `reports.test.js` |
| CT20 | Rate limit de login | Integração | **Passou** | `rate-limits.test.js` |
| CT21 | Rate limit geral | Integração | **Passou** | `rate-limits.test.js` |
| CT22 | Persistência após restart | Integração | **Passou** | `persistence.test.js` |
| CT23 | Schema e seed | Unitário | **Passou** | `schema.test.js` |
| CT24 | Login no webapp | UI | **Passou** | `index-page.test.js`, `login.test.js` |
| CT25 | Mapa só com aprovados | UI | **Passou** | `map-page.test.js` |
| CT26 | Popup e materiais | UI | **Passou com ressalva** | `map-page.test.js`, `misc.test.js`; o rótulo "Aberto" é fixo e não compara a hora atual |
| CT27 | Formulário de criação | UI | **Parcial** | `point-create-page.test.js`; 1 `todo` biológico |
| CT28 | Página de relato | UI | **Passou** | `user-report-page.test.js` |
| CT29 | Portal da ONG | UI | **Passou** | `ong-menu-page.test.js` |
| CT30 | Visibilidade do portal | UI | **Passou** | `menu-page.test.js` |
| CT31 | Manifesto PWA | Contrato | **Passou** | `manifest.test.js` |
| CT32 | Estrutura das páginas | Contrato | **Parcial** | `pages.test.js`; 1 `todo` de links quebrados |
| CT33 | Regressão de segurança | Segurança | **Parcial** | 13 ativos passam; 12 `skip` representam SEC abertos |
| — | Rejeição com justificativa (#7) | — | **Não implementado** | Sem rota/tela |
| — | Protocolo de relato (#8) | — | **Não implementado** | Sem campo/rota |
| — | Exportação CSV (#11) | — | **Não implementado** | Sem rota/tela |
| — | Dicas de separação (#12) | — | **Não implementado** | Só link estático |
| — | Deploy público | — | **Não realizado** | Sem URL |

## 3. Bugs encontrados e corrigidos nesta bateria

| # | Descrição | Severidade | Correção | Status |
|---|---|---|---|---|
| 1 | `/auth/token` emitia token com `code: "0"` sem OTC (SEC-001) | Crítica | `===` em `server.js`; `c9ea037` | Corrigido e testado |
| 2 | Todas as rotas aceitavam `token: "0"` quando não havia sessão (SEC-002) | Crítica | `===` em todas as comparações; `c9ea037` | Corrigido e testado |
| 3 | `/auth/special` aceitava array como código de escalação (SEC-003) | Baixa | `===`; `c9ea037` | Corrigido e testado |
| 4 | Strings de autenticação quebravam login | Alta | `f4004f2` | Corrigido |
| 5 | `async` faltando em handler | Média | `42b59c6` | Corrigido |
| 6 | `report` sem `uid` no schema | Alta | `ed71828` | Corrigido |
| 7 | Logins expirados não invalidados | Média | `5c85dfb` | Corrigido |
| 8 | Event listener registrado antes do elemento | Média | `56570ae` | Corrigido |
| 9 | Chamada de função errada no mapa | Média | `7a711b5` | Corrigido |

## 4. Bugs e pendências abertos

| # | Descrição | Severidade | Status |
|---|---|---|---|
| 1 | Checkbox biológico envia papel (`point-create.html.js`) | Média | Aberto; `it.todo` |
| 2 | Links para `/account-settings.html` inexistente | Baixa | Aberto; `it.todo` |
| 3 | Gráfico omite rótulos 18h/22h | Baixa | Aberto |
| 4 | `/point/list` expõe `approved = 0` e `creator` (SEC-004) | Média | Aberto; teste `skip` |
| 5 | Corpo ausente gera 500 HTML com stack (SEC-005) | Média | Aberto; testes `skip` |
| 6 | Rate limit atrás de proxy compartilha bucket (SEC-006) | Média | Aberto |
| 7 | Sem validação de coordenadas/horários (SEC-007) | Média | Aberto; testes `skip` |
| 8 | Token de escalação autogerado e logado (SEC-008) | Média | Aberto |
| 9 | Conta banida pode trocar OTC por token (SEC-009) | Média | Aberto; teste `skip` |
| 10 | Deleção não invalida token nem limpa `ong` (SEC-010) | Média | Aberto; testes `skip` |
| 11 | `pid` inexistente em relato/acesso (SEC-011) | Baixa | Aberto; teste `skip` |
| 12 | 404 HTML em rota desconhecida (SEC-012) | Baixa | Aberto; teste `skip` |
| 13 | XSS armazenado em horários (SEC-013) | Alta | Aberto |
| 14 | Sem CSP/X-Frame-Options; cookies sem `Secure`/`SameSite` (SEC-014) | Média | Aberto |
| 15 | Limite de descrição aplicado antes do XSS (SEC-015) | Baixa | Aberto; teste `skip` |
| 16 | Deploy público | Bloqueante | Aberto |

## 5. Testes de aceitação com cliente/PO

**Data:** 14/11/2026 (a data oficial da E9 era 06/11; a bateria foi concluída
depois).
**Participantes:** Heitor Benedetti Lopes (PO), Adrian Souza Teixeira e Victor
Breno Anastácio de Matos. **Não houve participação de cliente externo/ONG**;
o aceite é interno e precisa de validação do professor ou de uma ONG parceira.

**Roteiro executado:**

1. Login por OTC em modo convidado, com código lido no log.
2. Abertura do mapa, verificação dos oito ecopontos e clique em um marcador.
3. Abertura do popup, conferência de horário/materiais e clique em "Abrir no
   Maps" (registro de acesso).
4. Envio de relato de problema em um ponto.
5. Criação de ponto como cidadão (verificação de `approved = 0`).
6. Promoção da conta a ONG por código especial.
7. Aprovação do ponto pendente no portal da ONG, conferência da contagem de
   acessos e do gráfico por hora.
8. Remoção de um ponto de teste.
9. Logout e deleção de conta de teste.

**Resultado:** fluxo principal aprovado com ressalvas. O produto é
demonstrável localmente e cobre o ciclo cidadão → ONG. Não foi possível testar
em URL pública porque não há deploy.

## 6. Limitações da bateria

- **Sem deploy:** todos os testes de aceitação foram em `localhost`.
- **Sem teste de carga:** o rate limit foi testado funcionalmente, não sob
  estresse real.
- **Sem teste de acessibilidade:** não há auditoria WCAG, leitor de tela ou
  contraste automatizado.
- **Sem teste em navegadores múltiplos:** execução em um navegador desktop.
- **Sem cobertura de linhas:** a suíte é ampla por área, mas não há métrica
  percentual.
- **Sem cliente externo:** o aceite é do PO, não de uma ONG real.
- **Flake de harness observado:** em uma execução simultânea das duas suítes,
  `health.test.js` falhou uma vez com "API server did not become ready" (timeout
  de 10 s de inicialização). A execução isolada passou 79/79, sem alteração de
  código. O evento fica registrado para não tratar o verde como invariante sob
  carga concorrente.

## 7. Conclusão

A bateria final encontrou e corrigiu duas falhas críticas de autenticação e
deixou a suíte ativa verde (208 testes passando, 0 falhando). O produto atende
ao fluxo principal e a maior parte dos critérios Must, mas **não atende ao
critério de deploy público nem a quatro itens do escopo aceito** (rejeição,
protocolo de relato, exportação CSV e dicas de separação). Edição pela
interface, painel por material/bairro, indicação real de "aberto agora" e
consulta por distância também ficaram parciais. O aceite recomendado é **com
ressalvas**, não sem ressalvas.
