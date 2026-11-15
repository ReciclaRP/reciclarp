# Relatório da iteração de estabilização (pós-E8)

**Período:** 31/10/2026 a 14/11/2026
**Natureza:** iteração extra, não prevista no modelo E5–E8, aberta porque o MVP
não foi atingido na Sprint 4.
**Reconstruído em:** 14/11/2026
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

## 1. Por que esta iteração existiu

A Sprint 4 terminou em 30/10 com mapa, popup, login e relato funcionando, mas
sem criação de ponto, aprovação, portal da ONG, testes automatizados e deploy.
Declarar MVP naquele estado seria falso. A equipe abriu duas semanas extras
para fechar o fluxo principal e criar evidência de qualidade.

Esta iteração não tem E5–E8 correspondente; ela é registrada aqui porque a E9 e
a E10 dependem do que foi produzido nela.

## 2. Planejado vs. entregue

| Item | Entregue? | Evidência |
|---|---|---|
| Deleção de conta e logout | **Sim** | `a9d5cfe`, `830dedf`; `auth-delete.test.js`, `user-settings-page.test.js` |
| Navegação e menu do usuário | **Sim** | `3a533c1`, `77180b1`, `menu.html.js` |
| `robots.txt` | **Sim** | `2e07e7d` |
| Portal da ONG com tabela de pontos | **Sim** | `7a1510a`, `7a571fa`, `ong-menu.html.js` |
| Limite de requisições | **Sim** | `17c28df`; `rate-limits.test.js` |
| API de criação/edição/remoção de pontos | **Sim** | `fc5cdf2`, `e9a8be6`, `2708d46`, `3169e18` |
| Tela de criação de ponto | **Sim** | `b8b79af`, `dfa370f`, `a2dcf1d`, `962ac18` |
| Aprovação de pontos pela ONG | **Sim** | `6f63882`, `d992d15` |
| Rastreamento de acessos | **Sim** | `10276a8`, `7a711b5`, `56570ae` |
| Contagem e gráfico de acessos por hora | **Sim** | `59fce6a`, `2885d8f`, `d21ba50`, `4e596cc` |
| Manifesto PWA e favicon | **Sim** | `919650f`, `686bb21` |
| Resgate de código para ONG | **Sim** | `060abd2` |
| Suítes automatizadas de API e webapp | **Sim** | `7e211d0`, `256839b`, `ca01c0c` |
| Correções de segurança SEC-001/002/003 | **Sim** | `c9ea037`; `security.regression.test.js` |
| Documentação de agentes e testes | **Sim** | `4e0efd5`, `ca01c0c` |
| Deploy público | **Não** | Nenhuma URL publicada |
| Rejeição de ponto com justificativa | **Não** | Não há rota |
| Exportação CSV | **Não** | Não há rota/tela |
| Edição de ponto pela interface | **Não** | Só API |
| Painel por material/bairro | **Não** | Reinterpretado como acessos/hora |

## 3. Linha do tempo

| Data | Entrega |
|---|---|
| 31/10 | Navegação e stub de páginas (`343a627`). |
| 03/11 | Deleção de conta (`a9d5cfe`), `robots.txt` (`2e07e7d`), ajustes de navegação (`77180b1`, `3a533c1`). |
| 04/11 | Tabela de pontos no portal da ONG (`7a1510a`, `7a571fa`), correções de `npm audit` (`b062f05`), merge da `semana/6` (`388883a`). |
| 06/11 | Rate limiter (`17c28df`), rota `/api/ping` (`40ad8fb`), reorganização de estilos (`8a4a462`). |
| 08–09/11 | Reversão de design (`ac3e8d3`), API de edição (`fc5cdf2`) e criação (`e9a8be6`) de pontos, rate limit de escrita (`2d439fa`), primeiras suítes automatizadas (`7e211d0`, `256839b`), correções sugeridas por revisão automática (`04ca339`, `7be391f`, `f3ae675`). |
| 10/11 | Tela de criação de ponto (`b8b79af`), trabalho na feature (`dfa370f`, `a2dcf1d`, `962ac18`), endpoint de remoção (`2708d46`), popup de erro (`2b971a8`). |
| 11/11 | Deleção de pontos (`3169e18`), ajustes de portal (`6a8aa39`), documentação de agentes (`4e0efd5`), correções de XSS/OTC (`57f7870`), deleção de conta/logout (`830dedf`). |
| 12/11 | Validação de corpo (`f5842bb`), XSS (`992d893`), tamanho (`7e582f8`), resgate de código (`060abd2`), manifest/schema (`919650f`). |
| 13/11 | Rastreamento de acessos (`10276a8`, `7a711b5`, `56570ae`), aprovação de pontos (`6f63882`), nomes de botões (`d992d15`), popup de erro (`2b971a8`), tabela (`447b0e4`). |
| 14/11 | Rota de estatísticas (`59fce6a`), favicon (`686bb21`), exibição parcial (`2885d8f`), agregação por hora (`d21ba50`), contagem de acessos na tabela (`4e596cc`), testes de segurança e correções (`c9ea037`), documentação/testes (`ca01c0c`). |

## 4. Bugs e incidentes tratados

| # | Descrição | Correção | Status |
|---|---|---|---|
| 1 | Strings de autenticação quebravam o login | `f4004f2` | Corrigido |
| 2 | `async` faltando em handler | `42b59c6` | Corrigido |
| 3 | Schema de `report` sem `uid` | `ed71828` | Corrigido |
| 4 | Logins expirados não eram invalidados | `5c85dfb` | Corrigido |
| 5 | Event listener registrado antes do elemento existir | `56570ae` | Corrigido |
| 6 | Chamada de função incorreta no mapa | `7a711b5` | Corrigido |
| 7 | Bypass de OTC com `code: "0"` (SEC-001) | `c9ea037` | Corrigido |
| 8 | Bypass de token com `token: "0"` em todas as rotas (SEC-002) | `c9ea037` | Corrigido |
| 9 | Coerção no código de escalação (SEC-003) | `c9ea037` | Corrigido |
| 10 | Checkbox biológico envia papel | — | **Aberto** (`it.todo`) |
| 11 | Links para `/account-settings.html` inexistente | — | **Aberto** (`it.todo`) |
| 12 | Gráfico omite rótulos 18h/22h | — | **Aberto** |
| 13 | `/point/list` expõe pendentes (SEC-004) | — | **Aberto** (teste `skip`) |
| 14 | Erros 500 em corpo ausente (SEC-005) | — | **Aberto** (teste `skip`) |
| 15 | Sem validação de coordenadas/horário (SEC-007/SEC-013) | — | **Aberto** (testes `skip`) |
| 16 | Deploy não realizado | — | **Aberto** |

## 5. Testes criados na iteração

- **API:** `auth.test.js` (18), `auth-delete.test.js` (4), `points.test.js` (13),
  `reports.test.js` (4), `access.test.js` (8), `rate-limits.test.js` (5),
  `persistence.test.js` (1), `schema.test.js` (7), `health.test.js` (6) e
  `security.regression.test.js` (25, sendo 12 `skip`).
- **Webapp:** 15 arquivos, 131 testes (129 passam, 2 `todo`), cobrindo login,
  mapa, menu, portal da ONG, criação de ponto, relato, configurações, conta,
  manifesto, estrutura de páginas e lógica.
- **Resultado em 14/11/2026:** API 91 testes (79 passam, 12 pulados, 0 falham);
  webapp 131 (129 passam, 2 `todo`, 0 falham).

## 6. Segurança

A auditoria registrada em `docs/agent-docs/security.md` encontrou duas falhas
críticas de autenticação por coerção de tipos (`false == "0"`). Ambas foram
corrigidas em 14/11 com comparação estrita (`===`) e cobertas por testes
ativos. Permanecem abertos SEC-004 a SEC-015, incluindo XSS armazenado em
horários, exposição da fila de moderação, erros 500 com stack trace, rate limit
atrás de proxy, validação de coordenadas e deleção de conta que não invalida
sessão.

**Nenhuma instância pública foi auditada**; os testes foram feitos em ambiente
local descartável.

## 7. Retrospectiva da iteração

### O que funcionou

- A decisão de parar e estabilizar em vez de declarar MVP falso.
- A suíte de testes escrita em poucos dias, com servidor real e SQLite
  temporário, sem mock de backend.
- As correções de segurança críticas, com testes de regressão nomeados.
- O portal da ONG e o rastreamento de acessos deram à ONG uma razão concreta
  para usar o sistema.

### O que não funcionou

- O deploy continuou sem dono e sem data; é o maior buraco do fechamento.
- A rejeição de ponto, o protocolo de relato e a exportação CSV não entraram
  nem na iteração extra.
- A dívida de testes de quatro sprints foi paga em duas semanas, o que
  concentrou risco e atrasou a documentação.
- A auditoria de segurança só aconteceu no fim; duas falhas críticas poderiam
  ter sido exploradas durante semanas.

### Ações (para o fechamento)

| Ação | Responsável | Prazo |
|---|---|---|
| Publicar deploy e atualizar README/E10a | Adrian | Antes da Feira |
| Corrigir checkbox biológico e links quebrados | Heitor | Antes da Feira |
| Fechar ou aceitar formalmente SEC-004 a SEC-015 | Heitor/Victor | Antes da Feira |
| Revisar RA divergente e evidências individuais | Todos | Antes da entrega |
| Promover os documentos de `docs/wip/backfill` para os caminhos oficiais | PO | Após revisão |

## 8. Parecer

A iteração transformou um protótipo visual em um MVP funcional local. Ela não
resolveu o deploy nem os itens de escopo cortados, mas criou a base de testes e
a moderação que faltavam. O estado em 14/11/2026 é **MVP local demonstrável,
com dívida de deploy e de escopo declarada**.
