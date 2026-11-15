# Rastreabilidade atualizada — ReciclaRP

**Data:** 14/11/2026
**Cadeia:** História (E2) → Caso de uso (E3) → Entidade/tabela → Código → Teste
**Fonte de verdade do schema:** `api/src/db/schema.js` (o `db/schema.sql` é
cópia de referência e não é o schema vigente).

Esta é a versão corrigida de `docs/rastreabilidade.md`: troca os nomes antigos
(`usuario`, `ponto_coleta`, `requisicao_cadastro`) pelos nomes reais, aponta
para os arquivos implementados e acrescenta as histórias/fluxos que passaram a
existir depois da E4 (aprovação, remoção, acessos, logout, deleção de conta).

## 1. Matriz principal

| História | Caso de uso (E3, revisado) | Entidade / tabela real | Código (API) | Código (webapp) | Teste |
|---|---|---|---|---|---|
| #1 Criar conta / acessar | Autenticar com OTC | `user` | `POST /auth/login`, `POST /auth/token`, `Account`, `Tickets`, `Tokens` em `api/src/server.js` | `src/index.html.js`, `src/logic/login.js`, `src/logic/backend.js` | `api/tests/auth.test.js`; `webapp/tests/index-page.test.js`; `webapp/tests/login.test.js` |
| #2 Recuperar senha | Autenticar com OTC (substitui recuperação) | `user` + `Tickets` (memória) | `Tickets.purge()`, `RECICLA_OTC_DURATION`, `POST /auth/token` | `src/index.html.js` | `api/tests/auth.test.js` (código incorreto); `security.regression.test.js` (replay e código expirado) |
| #3 ONG cadastra ponto inicial | Cadastrar ponto (ONG) | `point`, `user` | `POST /point/create` com `is_ong()` → `approved = 1`; seed em `schema.js` | `webapp/src/point-create.html.js`, `webapp/point-create.html` | `api/tests/points.test.js`; `webapp/tests/point-create-page.test.js` |
| #4 Consultar mapa | Consultar pontos no mapa | `point` | `POST /point/list` (retorna todos; filtro no cliente) | `src/map.html.js`, `map.html` | `webapp/tests/map-page.test.js`; `api/tests/health.test.js` |
| #5 Ver detalhes | Visualizar detalhes do ponto | `point` | `POST /point/list` | `src/map.html.js` (popup), `src/logic/misc.js` | `webapp/tests/map-page.test.js`; `webapp/tests/misc.test.js` |
| #6 Cadastrar ponto colaborativo | Cadastrar ponto (cidadão) | `point` (`approved = 0`) | `POST /point/create` | `src/point-create.html.js`, `point-create.html` | `api/tests/points.test.js`; `webapp/tests/point-create-page.test.js` |
| #7 Aprovar/rejeitar requisição | Aprovar ponto | `point` (`approved`) | `POST /point/approve`; `Point.approve()` | `src/ong-menu.html.js` (`?approvepid=`) | `api/tests/points.test.js`; `webapp/tests/ong-menu-page.test.js` |
| #7 (rejeição) | Rejeitar ponto com justificativa | **não implementado** | **não implementado** | **não implementado** | **nenhum** — lacuna declarada |
| #8 Relatar problema | Relatar problema em ponto | `report`, `user`, `point` | `POST /report/create`; `create_report()` | `src/user-report.html.js`, `user-report.html` | `api/tests/reports.test.js`; `webapp/tests/user-report-page.test.js` |
| #9 Editar ponto/horários | Editar ponto | `point` | `POST /point/update` (ONG) | **sem tela** | `api/tests/points.test.js` |
| #10 Painel agregado | Consultar estatísticas de acesso | `access`, `point`, `user` | `POST /point/access/no`, `POST /point/access/get`; `Point.times_accessed()`, `get_accesses()` | `src/ong-menu.html.js`, `src/logic/points.js`, Chart.js | `api/tests/access.test.js`; `webapp/tests/ong-menu-page.test.js`; `webapp/tests/points-logic.test.js` |
| #10 (material/bairro) | Agregar por material/bairro | **não implementado** (não há bairro nem tabela de materiais) | **não implementado** | **não implementado** | **nenhum** — lacuna declarada |
| #11 Exportar CSV | Exportar relatório | **não implementado** | **não implementado** | **não implementado** | **nenhum** — lacuna declarada |
| #12 Dicas de separação | Visualizar dicas | **não implementado** (só link estático) | — | `menu.html` (`href="#"`) | `webapp/tests/pages.test.js` (estrutura) |
| #13 Push/SMS | — | fora de escopo | — | — | — |
| Fluxo extra: logout | Encerrar sessão | `Tokens` (memória) | `POST /auth/logout` | `src/logic/login.js` (`voluntaryInvalidateLogin`) | `api/tests/auth.test.js`; `webapp/tests/user-settings-page.test.js` |
| Fluxo extra: deletar conta | Excluir conta | `user` (anonimização) | `POST /auth/delete`; `Account.delete()` | `src/logic/login.js` (`deleteAccountAndInvalidate`) | `api/tests/auth-delete.test.js`; `webapp/tests/user-settings-page.test.js` |
| Fluxo extra: promover ONG | Resgatar código especial | `user.ong` | `POST /auth/special`; `Account.make_ong()` | `src/logic/account.js`, `user-settings.html` | `api/tests/security.regression.test.js`; `webapp/tests/account.test.js` |
| Fluxo extra: remover ponto | Remover ponto | `point` | `POST /point/remove`; `Point.delete()` | `src/ong-menu.html.js` (`?deletepid=`) | `api/tests/points.test.js`; `webapp/tests/ong-menu-page.test.js` |
| Fluxo extra: registrar acesso | Registrar abertura no Maps | `access` | `POST /point/access/log`; `Point.log_access()` | `src/map.html.js`, `src/logic/backend.js` | `api/tests/access.test.js`; `webapp/tests/map-page.test.js` |

## 2. Entidades reais

| Tabela | Campos | Papel |
|---|---|---|
| `user` | `id`, `uname`, `email` (UNIQUE), `banned`, `validated`, `ong` | Conta e perfil; `ong = 1` é o moderador. |
| `point` | `pid`, `pointdescription`, `lati`, `long`, `time_open`, `time_close`, `accepts_paper`, `accepts_metal`, `accepts_organic`, `accepts_biological`, `approved`, `creator` | Ponto de coleta; `approved = 0` é a fila de moderação. |
| `report` | `rid`, `reportdescription`, `category_noexist`, `category_full`, `category_badtime`, `uid`, `pid` | Relato de problema. |
| `access` | `aid`, `hour_accessed`, `uid`, `pid` | Associação N:N entre usuário e ponto, com atributo de hora. |

## 3. Observações de correção

- O caso de uso "Recuperar senha" e o atributo `senhaHash` do UML/DER estão
  históricos: a autenticação real é OTC e não guarda senha.
- O ator "Usuário" foi desdobrado em **visitante** (só `/point/list`),
  **cidadão** (cria ponto e relato) e **ONG** (`ong = 1`, modera e lê acessos).
- O `db/schema.sql` continua no repositório por referência, mas o schema
  executado é a string SQL de `api/src/db/schema.js`.
- A coluna "Código" desta matriz está preenchida; a versão oficial em
  `docs/rastreabilidade.md` ainda está vazia.
