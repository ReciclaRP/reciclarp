# E4b — Plano de Testes (revisão 3)

**Entrega:** E4 (Plano de Testes)
**Data de referência:** 11/09/2026
**Revisões:** 15/09/2026 (original) e 14/11/2026 (esta revisão)
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Trilha:** B

> Esta revisão substitui `docs/plano-de-testes.md`, que ainda cita PostgreSQL,
> recuperação de senha e nomes de tabela antigos. O plano original foi escrito
> antes das decisões de OTC e SQLite; os IDs foram renumerados e a
> correspondência com o plano antigo está na seção 5.

## 1. Estratégia

| Tipo | O que cobre | Projeto | Ferramenta | Quando roda |
|---|---|---|---|---|
| Unitário | Regras isoladas: conversão de flags, expiração de OTC, contagem de acessos, buckets de hora, descrição de materiais | `api` e `webapp` | `node:test` / Vitest | A cada PR |
| Integração | Rotas HTTP reais contra SQLite temporário: auth, pontos, acessos, relatos, rate limit, persistência | `api` | `node:test` + `fetch` + `tests/support/harness.js` | A cada PR (CI) |
| Integração de UI | Módulos de página com DOM stub, módulos `logic/*` mockados | `webapp` | Vitest + `tests/support/dom.js` | A cada PR (CI) |
| Contrato de páginas/PWA | Estrutura HTML, assets, links, manifesto, favicon | `webapp` | Vitest | A cada PR (CI) |
| Segurança | Regressão dos achados SEC-xxx | `api` | `node:test`; testes pulados até a correção | A cada PR (CI) |
| Aceitação manual | Fluxo completo no navegador, com API local | `webapp` + `api` | Roteiro manual (E9) | Fim de cada sprint e bateria final |

### Ambiente de teste da API

- Cada suíte sobe o **servidor real** (`api/src/server.js`) em uma porta livre,
  contra um **SQLite temporário** criado por `api/tests/support/harness.js`.
- Não há mock de backend. O helper de autenticação lê o código OTC do log da
  API em modo convidado (`api/tests/support/auth.js`).
- Limites de requisição são exercitados com `localAddress` distintos; testes
  que repetem `/auth/login`, `/auth/token`, `/point/create` ou `/point/update`
  não podem compartilhar IP.

### Ambiente de teste do webapp

- Não usa jsdom. `webapp/tests/support/dom.js` implementa elementos,
  documento, janela e cookie jar mínimos.
- Módulos de `src/logic/*` são mockados com `vi.mock`; os testes importam o
  módulo de página e verificam o DOM stub.
- Leaflet e Chart.js são mockados; o teste verifica as chamadas, não o desenho.

## 2. Critério de bloqueio de merge

1. Nenhum PR entra em `main` se a suíte do projeto afetado falhar.
2. Nenhuma regra de negócio nova entra sem teste correspondente.
3. Teste de segurança marcado como `skip` **não** pode ser "consertado"
   enfraquecendo a asserção: o `skip` só sai junto com a correção do SEC-xxx.
4. O bloqueio passa a valer em definitivo após o **decreto de MVP** pelo PO
   (README, "Convenções da equipe"). Antes disso, a equipe usa a suíte como
   sinal, não como bloqueio formal.

## 3. Casos de teste planejados

| ID | História / fluxo | Cenário | Entrada | Resultado esperado | Evidência automatizada |
|---|---|---|---|---|---|
| CT01 | #1 | Primeiro login cria conta e envia OTC | e-mail válido novo | Conta criada, `type: "okay"`, código de 6 dígitos emitido | `api/tests/auth.test.js` |
| CT02 | #2 | Troca de OTC válido, inválido e reutilizado | e-mail + código | Válido gera token; inválido recusa; replay recusa | `api/tests/auth.test.js`, `security.regression.test.js` |
| CT03 | #1 | Conta banida não recebe código | e-mail de conta com `banned = 1` | `type: "error"`, sem código | `api/tests/auth.test.js` |
| CT04 | Fluxo extra | Logout invalida a sessão | e-mail + token válido | `type: "okay"`; token deixa de autenticar | `api/tests/auth.test.js` |
| CT05 | Fluxo extra | Deleção anonimiza a conta | e-mail + token válido | `type: "okay"`; e-mail vira placeholder; login deixa de funcionar | `api/tests/auth-delete.test.js` |
| CT06 | #4 | Listagem pública de pontos | chamada anônima | Retorna array de pontos; **não deveria** expor `approved = 0` (SEC-004) | `api/tests/health.test.js`, `security.regression.test.js` (`skip`) |
| CT07 | #6 | Cidadão cria ponto pendente | token de cidadão + dados completos | `approved = 0`; aparece na fila da ONG | `api/tests/points.test.js` |
| CT08 | #3 | ONG cria ponto já aprovado | token de ONG + dados completos | `approved = 1`; visível no mapa | `api/tests/points.test.js` |
| CT09 | #3/#6 | Flags de material normalizadas | booleanos/strings | Apenas `true` vira `1`; demais viram `0` | `api/tests/points.test.js` |
| CT10 | #7 | ONG aprova ponto pendente | `pid` pendente + token ONG | `approved = 1`; criador preservado | `api/tests/points.test.js` |
| CT11 | #7 | Não-ONG não modera | token de cidadão em update/remove/approve | `type: "error"`; nada muda | `api/tests/security.regression.test.js`, `points.test.js` |
| CT12 | #9 | ONG atualiza ponto | dados completos + `pid` | Campos atualizados; `approved = 1`; criador preservado | `api/tests/points.test.js` |
| CT13 | Fluxo extra | ONG remove ponto | `pid` existente + token ONG | Ponto deixa de existir | `api/tests/points.test.js` |
| CT14 | Fluxo extra | Registro de acesso | usuário logado + `pid` | Uma linha em `access` com hora `HH:MM` | `api/tests/access.test.js` |
| CT15 | #10 | Contagem de acessos restrita à ONG | `pid` + token ONG / cidadão | ONG recebe `{ type: "okay", data: n }`; cidadão recebe erro | `api/tests/access.test.js` |
| CT16 | #10 | Acessos para o gráfico | `pid` + `no` + token ONG | Lista os `no` acessos mais novos; limite 1–1000 | `api/tests/access.test.js`; gráfico em `webapp/tests/ong-menu-page.test.js` |
| CT17 | #8 | Relato persiste | descrição + categoria + `pid` + token | Linha em `report` com `uid` e `pid` corretos | `api/tests/reports.test.js` |
| CT18 | #8 | Relato inválido | sem token / sem campo / categoria desconhecida | `type: "error"`; nada gravado | `api/tests/reports.test.js` |
| CT19 | #8 | Categorias do relato | três valores aceitos | Flag correspondente = 1 | `api/tests/reports.test.js` |
| CT20 | Transversal | Limite de login | duas requisições do mesmo IP em 2 min | Primeira passa; segunda recebe 429 | `api/tests/rate-limits.test.js` |
| CT21 | Transversal | Limite geral | 101 requisições em 15 min | 100 passam; 101ª recebe 429 | `api/tests/rate-limits.test.js` |
| CT22 | Transversal | Persistência após restart | conta e ponto criados; API reiniciada | Dados continuam; seed não duplica | `api/tests/persistence.test.js` |
| CT23 | Transversal | Schema e seed | banco novo | 4 tabelas, FKs, e-mail UNIQUE, 8 ecopontos aprovados | `api/tests/schema.test.js` |
| CT24 | #1 | Login no webapp | e-mail + código | Cookies `logintok`/`loginmail` gravados; redireciona ao mapa | `webapp/tests/index-page.test.js`, `login.test.js` |
| CT25 | #4/#5 | Mapa mostra só aprovados | pontos aprovados e pendentes | Marcador só para aprovados; popup abre no clique | `webapp/tests/map-page.test.js` |
| CT26 | #5 | Popup descreve materiais | ponto com flags | Lista materiais na ordem estável; horário e descrição aparecem | `webapp/tests/map-page.test.js`, `misc.test.js` |
| CT27 | #6 | Formulário de criação envia todos os campos | preenchimento completo | `createPoint` recebe os 9 campos; redireciona ao mapa/ONG | `webapp/tests/point-create-page.test.js` (1 `todo` para o defeito do biológico) |
| CT28 | #8 | Página de relato pré-preenche e envia | `?pid=` + descrição + categoria | Dados do ponto aparecem; `createReport` é chamado | `webapp/tests/user-report-page.test.js` |
| CT29 | #7/#10 | Portal da ONG | pontos + acessos | Tabela, aprovar, deletar, estatísticas e gráfico | `webapp/tests/ong-menu-page.test.js` |
| CT30 | #1/#7 | Menu mostra portal só para ONG | conta ONG / cidadão / deslogado | Link visível só para `ong = 1` | `webapp/tests/menu-page.test.js` |
| CT31 | Transversal | PWA instalável | manifesto + ícones | JSON válido, 192/512, link em todas as páginas | `webapp/tests/manifest.test.js` |
| CT32 | Transversal | Estrutura das páginas | todos os HTML | Assets locais existem; IDs e scripts esperados | `webapp/tests/pages.test.js` (1 `todo` para links quebrados) |
| CT33 | Segurança | Regressão SEC-001/002/003 | payloads de coerção | Rotas recusam `0`, `[]` e tokens alheios | `api/tests/security.regression.test.js` (13 ativos, 12 `skip`) |

## 4. Casos do escopo que não têm teste porque não foram implementados

| Item | História | Motivo |
|---|---|---|
| Rejeição de ponto com justificativa | #7 | Não existe rota nem tela de rejeição. |
| Protocolo/status de relato | #8 | `report` não tem protocolo nem status. |
| Edição de ponto pela interface | #9 | A rota existe; nenhuma tela a consome. |
| Agregação por material/bairro | #10 | O schema não tem bairro nem tabela de materiais. |
| Exportação CSV | #11 | Não implementada. |
| Página de dicas | #12 | Só existe o item de menu. |
| Deploy público | E2b | Não há URL publicada. |

## 5. Correspondência com o plano original (CT01–CT13)

| Plano original | Tema | Para onde foi |
|---|---|---|
| CT01 | Cadastro com e-mail duplicado | CT01/CT02 (OTC; a conta é reutilizada) |
| CT02 | Link/código de recuperação expirado | CT02 (código OTC expirado/incorreto) |
| CT03 | ONG cadastra ponto aprovado | CT08 |
| CT04 | Mapa só com aprovados | CT25 |
| CT05 | Detalhes e "aberto agora" | CT26 (o "aberto agora" segue não implementado) |
| CT06 | Cidadão cadastra ponto pendente | CT07 |
| CT07 | Rejeição com justificativa | **sem caso — não implementado** |
| CT08 | Aprovação de requisição | CT10 |
| CT09 | Relato com protocolo | CT17–CT19 (protocolo não implementado) |
| CT10 | Edição de horário inválido | CT12 (validação de horário não implementada) |
| CT11 | Painel agregado por material/bairro | CT16 (reinterpretado como acessos/hora) |
| CT12 | Exportação CSV | **sem caso — não implementado** |
| CT13 | Dicas de separação | **sem caso — não implementado** |

## 6. Cobertura e limitações

- **API:** 91 testes, 79 ativos, 12 pulados, 0 falhando (14/11/2026). Os
  pulados são a dívida SEC-004/005/007/009/010/011/012/015.
- **Webapp:** 131 testes, 129 ativos, 2 `todo`, 0 falhando. Os `todo` são o
  defeito do checkbox biológico e os links quebrados para
  `/account-settings.html`.
- **Sem medição de cobertura de linhas:** o projeto não configurou
  `c8`/`istanbul`. A cobertura é descrita por área, não por percentual.
- **Sem teste automatizado de ponta a ponta real:** os testes de webapp usam
  DOM stub; o fluxo completo é verificado no roteiro manual da E9.
- **Sem teste de carga/segurança dinâmica:** o rate limit é testado
  funcionalmente; não há teste de estresse.
