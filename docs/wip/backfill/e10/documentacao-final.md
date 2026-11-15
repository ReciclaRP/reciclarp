# Documentação Final — ReciclaRP

**Deploy definitivo:** **não disponível.** Nenhuma URL pública foi publicada até
14/11/2026. O critério "Sistema publicamente acessível por URL" da E2b continua
**não atendido**; ver §2 e §5.
**Repositório:** https://github.com/ReciclaRP/reciclarp
**Branch de referência:** `semana/7` — commit `ca01c0c`
**Data de consolidação:** 14/11/2026 (a data oficial da E10 era 13/11/2026)
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Trilha:** B

> **Status deste documento.** Consolidação proposta, escrita em `docs/wip/` por
> agentes, conforme o contrato de `AGENTS.md`. Não substitui os artefatos oficiais
> em `docs/` e não foi promovida para `README.md`. Os caminhos marcados como
> "backfill" ainda precisam ser revisados pelo PO e copiados por uma pessoa
> mantenedora.

## 1. Índice de artefatos do semestre

| Entrega | Documento | Caminho | Status |
|---|---|---|---|
| E1 | Documento de Visão | [`docs/Entrega1LES.pdf`](../../../Entrega1LES.pdf) | Oficial (PDF) |
| E2 | Backlog priorizado | [`docs/Backlog.pdf`](../../../Backlog.pdf) | Oficial (PDF) |
| E2 | Termo de Aceite do Projeto | [`docs/TermoAceite.pdf`](../../../TermoAceite.pdf) | Oficial (PDF, 28/08/2026) |
| E3 | UML | [`docs/uml.md`](../../../uml.md) | Oficial |
| E3 | DER | [`docs/der.md`](../../../der.md) | Oficial; desatualizado em relação ao SQLite |
| E3 | DDL de referência | [`db/schema.sql`](../../../../db/schema.sql) | Referência apenas; o schema vigente é [`api/src/db/schema.js`](../../../../api/src/db/schema.js) |
| E4a | README e conformidade | [`README.md`](../../../../README.md) e [`e4a-readme-conformidade.md`](../e4/e4a-readme-conformidade.md) | README oficial; conferência em backfill |
| E4b | Plano de Testes | [`docs/plano-de-testes.md`](../../../plano-de-testes.md) e [`e4b-plano-de-testes.md`](../e4/e4b-plano-de-testes.md) | Plano oficial (CT01–CT13); revisão em backfill (CT01–CT33) |
| E4c | Roteiro do Protótipo | [`docs/prototipo.md`](../../../prototipo.md) e [`e4c-prototipo.md`](../e4/e4c-prototipo.md) | Oficial + mapeamento para a implementação em backfill |
| E5 | Sprint 1 (18/09) | [`e5/`](../e5/) | Backfill: relatório, retrospectiva, evidências e 3 contribuições |
| E6 | Sprint 2 (02/10) | [`e6/`](../e6/) | Backfill: idem |
| E7 | Sprint 3 (16/10) | [`e7/`](../e7/) | Backfill: idem |
| E8 | Sprint 4 (30/10) | [`e8/`](../e8/) | Backfill: idem |
| Pós-E8 | Iteração de estabilização (31/10–14/11) | [`pos-e8/relatorio-estabilizacao.md`](../pos-e8/relatorio-estabilizacao.md) | Backfill: iteração real que produziu o MVP demonstrável |
| E9a | Relatório de Testes Executados | [`e9/relatorio-testes-final.md`](../e9/relatorio-testes-final.md) | Backfill |
| E9b | Termo de Aceite do Cliente | [`e9/termo-aceite-cliente.md`](../e9/termo-aceite-cliente.md) | Backfill: minuta, sem assinatura e sem cliente externo |
| E10a | Documentação Final | este arquivo | Backfill |
| E10b | Manual do Usuário | [`manual-do-usuario.md`](manual-do-usuario.md) | Backfill |
| E10c | Roteiro de Apresentação e Vídeo | [`roteiro-apresentacao.md`](roteiro-apresentacao.md) | Backfill |
| Apoio | Backlog com estado real | [`backlog-atualizado.md`](../backlog-atualizado.md) | Backfill |
| Apoio | Matriz de rastreabilidade | [`rastreabilidade-atualizada.md`](../rastreabilidade-atualizada.md) | Backfill |
| Apoio | Notas de arquitetura e API | [`docs/agent-docs/`](../../../agent-docs/) | Apoio a contribuidores |

**Observação sobre as sprints.** Os relatórios E5–E8 foram reconstruídos depois
do período e registram essa condição em cada arquivo. As datas oficiais são
18/09, 02/10, 16/10 e 30/10/2026. O incremento que tornou o produto demonstrável
ocorreu na iteração pós-E8, documentada separadamente; atribuí-lo à Sprint 4
seria falso.

## 2. Desvios do escopo original (vs. E2b)

A E2b congelou 11 funcionalidades Must + Should, 6 critérios de MVP e uma stack
(PostgreSQL, VPS no Google Cloud). A tabela abaixo compara o que foi aceito com o
que existe em 14/11/2026. "Negociado?" indica se há registro formal de acordo com
o professor ou cliente; a ausência desse registro é declarada em vez de suprida.

| Item da E2b | Situação final | Mudou? | Justificativa registrada | Negociado? |
|---|---|---|---|---|
| Banco PostgreSQL + PostGIS | **SQLite** (`better-sqlite3`), arquivo único | Sim | Banco embutido, adequado a um único host e mais simples de operar em projeto acadêmico. Registrado em `docs/prototipo.md` e no README. Commit `e105325` (17/09/2026). | **Não formalmente.** A mudança está documentada, mas não há aceite escrito do professor. |
| Cadastro com senha + recuperação por e-mail | **OTC de seis dígitos**, cadastro automático no primeiro acesso | Sim | Elimina armazenamento de senha e unifica cadastro, login e recuperação. Commits `90e65b6` e `e54b1da` (17–20/09/2026). | **Não formalmente.** Documentado no protótipo e no README. |
| Deploy em VPS no Google Cloud, acessível por URL | **Não realizado**; apenas `localhost` | Sim | Prioridade dada a estabilização e segurança na iteração pós-E8; nenhum registro de decisão formal. | **Não.** É o desvio de maior impacto e permanece bloqueante. |
| Aprovação **e rejeição** de requisições pela ONG | Só **aprovação** (`/point/approve`); sem rejeição nem justificativa | Parcial | Não houve decisão registrada; a rejeição simplesmente não foi implementada. | **Não.** Redução não negociada. |
| Relato de problema **com protocolo** | Relato gravado com três categorias; **sem protocolo, status ou fila para a ONG** | Parcial | Implementação priorizou o registro do dado; o retorno ao cidadão ficou pendente. | **Não.** |
| Painel com total de pontos **agrupados por material** | Portal com tabela de pontos, contagem de acessos e **gráfico de acessos por hora** | Reinterpretado | O modelo não tem bairro nem tabela de materiais; optou-se por visibilidade de uso dos pontos. Commits `59fce6a` e `d21ba50` (13–14/11/2026). | **Não.** A decisão ocorreu **depois** da Semana 10, fora da janela em que a rubrica admite redução negociada. |
| Exportação do painel em **CSV** | **Não entregue** | Sim | Sem botão e sem rota. Não há justificativa registrada. | **Não.** |
| Edição de horários e informações pela ONG | Rota `POST /point/update` existe e é testada; **sem tela** | Parcial | A API foi priorizada; a interface não foi construída. | **Não.** |
| Consulta de pontos **próximos**, ordenados por distância | Mapa Leaflet funcional, **sem geolocalização e sem ordenação**; centro fixo em Ribeirão Preto | Parcial | Simplificação de escopo não registrada em ata. | **Não.** |
| Dicas de separação (Could) | Item "Dicas de reciclagem" no menu, com `href="#"`; **sem página** | Parcial | Não implementado. | Não se aplica (Could). |
| 6+ entidades com relacionamento N:N (Manual §3) | **4 tabelas**: `user`, `point`, `report`, `access`. `access` é N:N com atributo (hora), mas o número exigido não é atingido | Sim | Modelagem enxuta para o MVP. O DER oficial ainda descreve outro modelo. | **Não.** Requisito do Manual, não negociado. |
| Frontend "PWA com possível integração futura com Vite" | **Vite adotado** como build real, JavaScript sem framework; Chart.js e Leaflet | Sim (melhoria) | Decisão de implementação; não reduz escopo. | Não requer negociação. |
| Notificação push/SMS de coleta por rua | Fora de escopo desde a E1 (`Won't`) | Não | Documento de Visão, seção 5. | Sim (desde a E1). |

**Leitura exigida pela rubrica.** Reduções negociadas até a Semana 10 não
penalizam; abandono silencioso, sim. O registro honesto é: **houve redução de
escopo não negociada formalmente**. As mudanças de stack foram documentadas, mas
não aceitas por escrito; a rejeição, o protocolo, o CSV e o painel por material
não têm registro de decisão; o deploy nunca foi executado. Este documento não
tenta transformar esses fatos em entrega.

## 3. Arquitetura final (resumo)

Sem mudança de camadas desde a E4; houve mudança de tecnologias e de modelo de
dados.

```
┌──────────────────────────────────────────────────────────────┐
│ webapp/ — Vite, JavaScript sem framework, multipágina         │
│                                                              │
│  index.html       login OTC                                  │
│  map.html         Leaflet + OpenStreetMap + popup + relato   │
│  menu.html        atalhos; portal da ONG se user.ong = 1     │
│  point-create.html  criação de ponto (cidadão/ONG)           │
│  user-report.html   relato de problema                       │
│  user-settings.html logout, deletar conta, código especial   │
│  ong-menu.html    tabela, aprovação, remoção, estatísticas   │
│                                                              │
│  cookies: logintok + loginmail                               │
│  API_URL fixa em src/logic/backend.js (http://localhost:3000)│
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP/JSON (POST em todas as rotas,
                            │ exceto GET /api/ping)
┌───────────────────────────▼──────────────────────────────────┐
│ api/ — Node.js + Express 5, arquivo único src/server.js      │
│                                                              │
│  auth: OTC 6 dígitos → token de sessão em memória            │
│  autorização: user.ong, user.banned, is_ong()                │
│  rate limit por IP (express-rate-limit)                      │
│  e-mail: Resend; sem chave → código no log ("modo convidado")│
│  estáticos: não serve o webapp                               │
└───────────────────────────┬──────────────────────────────────┘
                            │ better-sqlite3 (síncrono)
┌───────────────────────────▼──────────────────────────────────┐
│ SQLite — api/recicladb.sqlite (dev, gitignored)              │
│                                                              │
│  user(id, uname, email, banned, validated, ong)              │
│  point(pid, pointdescription, lati, long, time_open,         │
│        time_close, accepts_paper/metal/organic/biological,   │
│        approved, creator → user.id)                          │
│  report(rid, reportdescription, category_noexist/full/       │
│         badtime, uid → user.id, pid → point.pid)             │
│  access(aid, hour_accessed, uid → user.id, pid → point.pid)  │
└──────────────────────────────────────────────────────────────┘
```

**Fluxos centrais.**

1. **Autenticação:** `POST /auth/login` gera OTC de seis dígitos e o envia por
   e-mail (ou imprime no log). `POST /auth/token` troca o código por um token de
   sessão em memória. Reiniciar a API invalida todos os logins.
2. **Consulta:** `POST /point/list` retorna os pontos; o webapp filtra
   `approved` para desenhar marcadores. O popup oferece "Abrir no Maps",
   "Reportar Problema" e "Sugerir edição" (este último sem destino).
3. **Moderação:** conta ONG vê o portal, aprova pendentes, remove pontos e
   consulta acessos por hora. A aprovação e a remoção usam links com query param
   e confirmação em `window.confirm`; não há registro de quem moderou.
4. **Telemetria:** abrir um ponto pelo Maps registra `access` com hora; a ONG lê
   a contagem e o gráfico.
5. **Relato:** `POST /report/create` grava descrição, categoria e vínculo ao
   ponto; não há leitura pela ONG nem retorno ao cidadão.

**Operação e qualidade.**

- **Testes:** API com `node:test` contra servidor real e SQLite temporário; webapp
  com Vitest e DOM stubado. Estado em 14/11/2026, em execução isolada de cada
  suíte: 222 testes, 208 passando, 12 `skip`, 2 `todo`, 0 falhas. Uma execução
  concorrente das duas suítes produziu um timeout de inicialização do harness em
  `health.test.js`, não reproduzido isoladamente (ver E9a, §6).
- **CI:** `.github/workflows/main.yml` roda as duas suítes em push/PR para `main`.
- **Segurança:** SEC-001/002/003 corrigidos; SEC-004 a SEC-015 abertos. A suíte de
  regressão mantém 12 testes `skip` que descrevem o comportamento seguro
  esperado, para não confundir dívida com cobertura.
- **Hospedagem:** inexistente. O sistema só foi executado localmente.

## 4. Como rodar e contribuir

O passo a passo completo está no [`README.md`](../../../../README.md). Resumo:

```bash
# API (porta 3000 por padrão; lê api/.env)
cd api && npm install && npm run dev

# Webapp (Vite; API_URL fixa em http://localhost:3000)
cd webapp && npm install && npm run dev

# Testes
cd api && npm test
cd webapp && npx vitest run
```

Pontos de atenção que o README já registra e que continuam válidos:

- sem `RECICLA_RESEND_SECRET`, a API opera em **modo convidado** e imprime o
  código OTC no log — use apenas localmente;
- a URL da API é **fixa** em `webapp/src/logic/backend.js`;
- `db/schema.sql` é referência, não o schema vigente;
- rate limits de 1 requisição por 2 minutos em `/auth/login`, `/point/create` e
  `/point/update` atrapalham testes manuais repetidos.

**Contribuição:** branches `semana/<n>`, Conventional Commits em português (sem
`!`), revisão do PO obrigatória antes de integrar em `main`. Agentes contribuem
com testes e documentação em `docs/wip/`, não com código de aplicação — ver
`AGENTS.md`.

## 5. Pendências para promoção e para o aceite

| # | Pendência | Bloqueia o quê | Responsável sugerido |
|---|---|---|---|
| 1 | Publicar deploy e registrar a URL real no README e neste documento | Aceite integral do MVP (E2b) | Equipe / PO |
| 2 | Implementar rejeição com justificativa e aviso ao autor | Funcionalidade #7 da E2b | Equipe |
| 3 | Entregar painel por material **ou** renegociar o critério por escrito | Critério de MVP da E2b | PO + professor |
| 4 | Entregar CSV **ou** removê-lo formalmente do escopo | Funcionalidade #11 da E2b | PO + professor |
| 5 | Corrigir checkbox biológico, links para `/account-settings.html` e rótulos 18h/22h | Qualidade de demonstração | Equipe |
| 6 | Decidir o destino dos SEC-004 a SEC-015 (corrigir ou aceitar por escrito) | Segurança e aceite | Equipe + professor |
| 7 | Resolver a divergência de RA de Adrian entre PDFs e Markdown | Documentos oficiais | Equipe |
| 8 | Anexar evidência complementar de Adrian e Victor (pair programming, atas, PRs) | Fator de contribuição individual | Equipe |
| 9 | Copiar os arquivos aprovados de `docs/wip/backfill/` para os caminhos oficiais | Entrega formal | Pessoa mantenedora |

## 6. Rastreabilidade

A matriz completa está em
[`rastreabilidade-atualizada.md`](../rastreabilidade-atualizada.md). Ela liga
cada história do backlog ao caso de uso, à tabela do SQLite, ao arquivo de código
e ao teste que comprova o comportamento. O resumo por entrega está no §1 deste
documento, e o estado por história está em
[`backlog-atualizado.md`](../backlog-atualizado.md).

## 7. Equipe

| Integrante | RA | Papel declarado na E2b | Participação comprovável |
|---|---|---|---|
| Heitor Benedetti Lopes | 2840482421003 | Product Owner / Backend / Frontend elementar | Histórico Git sob `HLRangel`; autoria dos commits do período |
| Adrian Souza Teixeira | 2840482421051 | Dados (modelagem, banco, PostGIS) | Sem commits assinados no período; requer evidência complementar |
| Victor Breno Anastácio de Matos | 2840482313038 | Qualidade (frontend, testes) | Sem commits assinados no período; requer evidência complementar |

**Divergência registrada:** os PDFs da E1/E2 trazem o RA de Adrian como
`2840484221051`; os Markdown da E3/E4 e este backfill usam `2840482421051`. O
valor correto precisa ser confirmado pela equipe antes da versão oficial.
