# Relatório de divergência da documentação acadêmica

**Data:** 14/11/2026
**Fonte de verdade:** `api/src/server.js`, `api/src/db/schema.js`,
`webapp/src/**` e as suítes `api/tests/` e `webapp/tests/`.

Este documento registra onde os entregáveis acadêmicos em `docs/` divergem do
software em execução. Ele existe porque os agentes **não podem editar** os
documentos acadêmicos (ver `AGENTS.md`, "Agent role and boundaries"); as
alterações abaixo precisam ser aplicadas por uma pessoa mantenedora.

O software está em desenvolvimento ativo e o backlog continua sendo a fonte
funcional de verdade. A divergência abaixo é de **implementação e nomenclatura**,
não uma mudança unilateral de escopo.

## 1. Resumo por documento

| Documento | Divergência principal |
| --- | --- |
| `der.md` | Modelo PostgreSQL normalizado (6 tabelas, `SERIAL`, `senha_hash`, `perfil`, `status`) contra o schema real SQLite com 4 tabelas (`user`, `point`, `report`, `access`). |
| `uml.md` | Caso de uso "Recuperar senha" e atributo `senhaHash`; a autenticação real é por código OTC de 6 dígitos, sem senha. Faltam aprovação de ponto e estatísticas de acesso. |
| `plano-de-testes.md` | Cita integração com PostgreSQL e recuperação de senha; casos CT03/CT04/CT06 usam `status = 'aprovado'/'pendente'` em vez de `approved = 1/0`. Ferramentas e contagens de teste estão desatualizadas. |
| `rastreabilidade.md` | Usa nomes de tabela antigos (`usuario`, `ponto_coleta`, `requisicao_cadastro`) e aponta para `schema.sql`, que não é o schema vigente. Não há linhas para aprovação nem para o log de acessos. |
| `prototipo.md` | Já registra a decisão por OTC; usa apenas números de tela e não mapeia as histórias #9, #11 e #12 para a implementação atual. |
| `README.md` | Atualizado nesta rodada: branch, OTC, URL fixa da API, comandos de teste e estrutura. |

## 2. `der.md`

Estado atual do arquivo: diagrama com `usuario`, `ponto_coleta`,
`material_aceito`, `ponto_material`, `horario_funcionamento` e
`requisicao_cadastro`, usando tipos PostgreSQL (`SERIAL`, `DECIMAL(9,6)`,
`TIMESTAMP`).

Schema real (`api/src/db/schema.js`):

- `user(id, uname, email, banned, validated, ong)`
- `point(pid, pointdescription, lati, long, time_open, time_close,
  accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved,
  creator)`
- `report(rid, reportdescription, category_noexist, category_full,
  category_badtime, uid, pid)`
- `access(aid, hour_accessed, uid, pid)`

Alterações propostas:

1. Trocar o SGBD do diagrama para **SQLite** e os tipos para `INTEGER PRIMARY
   KEY AUTOINCREMENT`, `TEXT`, `REAL` e `BOOLEAN`.
2. Substituir `usuario` por `user`; remover `senha_hash` e `perfil`; acrescentar
   `banned`, `validated` e `ong`.
3. Substituir `ponto_coleta` por `point`; trocar `endereco`/`bairro` por
   `pointdescription`, `status` por `approved`, `criado_por` por `creator`;
   incorporar `time_open`/`time_close` e as quatro flags `accepts_*`.
4. Remover `material_aceito`, `ponto_material`, `horario_funcionamento` e
   `requisicao_cadastro`. As flags de material e a aprovação vivem em `point`;
   não há tabela separada de requisição — um ponto pendente é `approved = 0`.
5. Acrescentar `report` e `access`, com as FKs para `user` e `point`.
6. Atualizar o texto que diz que o DER reflete `db/schema.sql`: o arquivo
   vigente é `api/src/db/schema.js`.

## 3. `uml.md`

- O caso de uso **"Recuperar senha"** e o atributo `senhaHash` não existem no
  código. Substituir por **"Autenticar com código de uso único (OTC)"**, com o
  fluxo `POST /auth/login` → código de 6 dígitos (e-mail ou log) →
  `POST /auth/token`.
- Acrescentar os casos de uso já implementados: **aprovar ponto**,
  **remover ponto** e **consultar estatísticas de acesso**.
- O ator "Usuário" pode ser desdobrado em **Visitante**, **Cidadão** e **ONG**,
  porque as permissões são diferentes (`ong = 1`).
- Observação: o diagrama pode continuar intencionalmente no nível de
  requisitos; se for esse o caso, registrar em nota que senha foi substituída
  por OTC e que `senhaHash` é histórico.

## 4. `plano-de-testes.md`

| Item | Texto atual | Estado real |
| --- | --- | --- |
| Estratégia | "integração com PostgreSQL" | SQLite via `better-sqlite3`; cada teste da API sobe o servidor real contra um banco temporário. |
| Ferramenta do `webapp` | "roteiro manual em planilha" | Existe suíte automatizada com **Vitest** (`webapp/tests/`), além do roteiro manual. |
| CT01 | cadastro recusa e-mail duplicado | Não há cadastro separado: `POST /auth/login` cria a conta automaticamente na primeira vez; o e-mail é `UNIQUE`. |
| CT02 | link/código de redefinição de senha expirado | Não há redefinição de senha. O caso equivalente é **código OTC expirado/incorreto**, que deve ser recusado. |
| CT03/CT06 | `status = 'aprovado'` / `'pendente'` | Coluna booleana `approved` (`1`/`0`). Ponto criado por cidadão nasce `approved = 0`; criado por ONG nasce `approved = 1`. |
| CT04 | mapa lista só `status = 'aprovado'` | O mapa filtra `point.approved` no cliente (`6f63882`). A API `/point/list` ainda devolve todos os pontos, inclusive pendentes (SEC-004). |
| Contagens | não havia contagens | API: **91 testes, 79 passam, 12 pulados, 0 falham**. Webapp: **131 testes em 15 arquivos, 129 passam, 2 `todo`, 0 falham** (14/11/2026). |
| Cobertura nova | ausente | Acrescentar casos para `/auth/logout`, `/point/approve`, `/point/remove`, `/point/access/log`, `/point/access/get` e `/point/access/no`. |

Os 12 testes pulados da API são os `SEC-xxx` ainda abertos em
`docs/agent-docs/security.md`; eles descrevem o comportamento seguro esperado e
só devem ser reativados junto com a correção correspondente.

## 5. `rastreabilidade.md`

- A coluna "Tabela(s)" aponta para `schema.sql`, que é somente referência.
  Atualizar a nota para `api/src/db/schema.js`.
- Nomes a substituir: `usuario` → `user`; `ponto_coleta` → `point`;
  `requisicao_cadastro` → `point` com `approved = 0`.
- Acrescentar linhas para:
  - aprovação de ponto pela ONG (`/point/approve`, `point.approved`);
  - remoção de ponto (`/point/remove`, `point`);
  - estatísticas de acesso (`/point/access/*`, `access`);
  - login/logout por OTC (`/auth/login`, `/auth/token`, `/auth/logout`).
- A coluna "Código" ainda está vazia em várias linhas; apontar para os módulos
  reais (`webapp/src/map.html.js`, `webapp/src/ong-menu.html.js`,
  `api/src/server.js`).

## 6. `prototipo.md`

- A decisão por OTC já está registrada; manter.
- A tabela usa apenas números de tela (1–14), sem nomes de arquivo. Acrescentar
  uma coluna "Implementação atual" apontando para:
  `index.html` (telas 1/2, login OTC), `map.html` (telas 3–5, mapa e popup),
  `point-create.html` (tela 6), `ong-menu.html` (telas 7–10, aprovação, tabela
  e estatísticas), `user-report.html` (tela 8) e `menu.html`/`user-settings.html`
  (navegação e conta).
- Histórias sem UI implementada no `webapp` hoje:
  - **#9** — editar ponto aprovado (existe `POST /point/update` na API, mas
    nenhuma tela o consome);
  - **#11** — exportar relatório do painel (não há botão nem endpoint);
  - **#12** — dicas de separação (há apenas um texto estático em `menu.html`).
  Marcar essas linhas como pendentes, em vez de descrevê-las como prontas.
- `account-settings.html`, `ong-create.html` e `ong-pontos.html` **não
  existem**. Os links para `/account-settings.html` em `menu.html` e
  `user-settings.html` são um defeito conhecido, coberto por `it.todo` em
  `webapp/tests/pages.test.js`; não descrever a tela como se existisse.

## 7. Divergências que exigem código, não documentação

Registradas aqui para não serem "documentadas como corretas" por engano:

- `point-create.html.js` passa o checkbox de papel também como argumento de
  biológico. Coberto por `it.todo` em `webapp/tests/point-create-page.test.js`.
- Links para `/account-settings.html` em `menu.html` e `user-settings.html`.
  Cobertos por `it.todo` em `webapp/tests/pages.test.js`.
- O gráfico da ONG usa 22 rótulos e omite `18h` e `22h`, embora o bucket tenha
  24 posições. O teste atual verifica apenas os dados dos buckets (7h e 15h),
  não os rótulos; o defeito de rotulagem segue sem cobertura.
- `/point/list` devolve `approved = 0` e `creator` para chamadores anônimos
  (SEC-004).
