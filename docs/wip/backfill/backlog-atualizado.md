# Backlog atualizado — ReciclaRP

**Referência:** `docs/Backlog.pdf` (E2, 28/08/2026) e `docs/TermoAceite.pdf`
**Snapshot:** 14/11/2026, branch `semana/7`, commit `ca01c0c`
**Regra:** o estado abaixo é o que o código e os testes comprovam, não o que o
backlog planejava.

## 1. Estado por história

| # | História (resumo) | MoSCoW | Sprint alvo | Estado em 14/11 | Evidência principal | Pendência |
|---|---|---|---|---|---|---|
| 1 | Criar conta com e-mail e senha para acessar o sistema | Must | 1 | **Entregue, com mudança de mecanismo** | Login OTC em `POST /auth/login` e `/auth/token`; conta criada automaticamente no primeiro acesso válido; `api/tests/auth.test.js` | Não há senha; a história foi substituída por OTC. Critérios de "senha mínima" não se aplicam. |
| 2 | Recuperar senha por e-mail | Should | 1 | **Entregue por design** | OTC cobre o caso: todo login é um código de uso único; `Tickets.purge()` expira em `RECICLA_OTC_DURATION` (15 min) | Não existe "link de redefinição"; o critério de link expirado foi reinterpretado como código expirado. |
| 3 | ONG cadastra os primeiros pontos | Must | 1 | **Entregue** | Seed com 8 ecopontos em `api/src/db/schema.js`; conta ONG cria ponto já aprovado (`api/tests/points.test.js`) | Só é possível criar ponto pela tela `point-create.html`, com latitude/longitude digitadas manualmente. |
| 4 | Consultar pontos no mapa, ordenados por distância | Must | 2 | **Parcial** | Mapa Leaflet com marcadores apenas de `approved = 1` (`map-page.test.js`) | Não usa geolocalização nem ordena por distância; abre fixo em Ribeirão Preto. |
| 5 | Ver detalhes do ponto e saber se está aberto | Must | 2 | **Parcial** | Popup com descrição, horário e materiais (`map-page.test.js`); `descriptionFromPointTypes` | O rótulo "Aberto" é fixo; não compara o horário atual com `time_open`/`time_close`. |
| 6 | Cadastrar ponto colaborativo que entra pendente | Must | 2 | **Entregue** | `POST /point/create` grava `approved = 0` para cidadão; `point-create.html`; `points.test.js` | O formulário não mostra o estado "pendente" após o envio; defeito conhecido envia papel no lugar de biológico. |
| 7 | ONG analisa e aprova/rejeita requisições | Must | 3 | **Parcial** | Aprovação em `POST /point/approve` e no portal da ONG (`ong-menu-page.test.js`) | **Rejeição com justificativa não existe.** Também não há aviso ao autor da contribuição. |
| 8 | Relatar problema em ponto, com protocolo | Should | 3 | **Parcial** | `POST /report/create` com três categorias; `reports.test.js`; tela `user-report.html` | Não gera protocolo, não tem status nem listagem para a ONG. |
| 9 | ONG edita horários e informações do ponto | Must | 3 | **Parcial** | `POST /point/update`, restrito a ONG, testado em `points.test.js` | Nenhuma tela do webapp consome a rota; não há histórico de alteração. |
| 10 | Painel com total de pontos por material e bairro | Must | 4 | **Reinterpretado** | Portal da ONG com tabela de pontos, contagem de acessos e gráfico por hora (`ong-menu-page.test.js`) | Não agrega por material nem por bairro; a consulta agregada existente é `COUNT(*)` de acessos e bucket por hora. |
| 11 | Exportar relatório do painel em CSV | Should | 4 | **Não entregue** | — | Não há botão nem endpoint de exportação. |
| 12 | Ver dicas curtas de separação | Could | 4 | **Parcial** | Item "Dicas de reciclagem" em `menu.html` | O link é `href="#"`; não existe página de conteúdo nem cadastro de dicas pela ONG. |
| 13 | Notificação push/SMS de coleta por rua | Won't | — | **Fora de escopo** | Documento de Visão, seção 5 | Mantido fora de escopo. |

## 2. Mudanças de escopo em relação à E2b

| Mudança | Data aproximada | Justificativa registrada |
|---|---|---|
| PostgreSQL → SQLite | 17/09/2026 (`e105325`) | Banco embutido em arquivo único, adequado a um único host e muito mais simples de subir para um projeto acadêmico. O `TermoAceite.pdf` e o DER ainda citam PostgreSQL. |
| Senha + recuperação → OTC de seis dígitos | 17–20/09/2026 (`90e65b6`, `e54b1da`) | Elimina armazenamento de senha e une cadastro, login e recuperação em um único fluxo. Registrado em `docs/prototipo.md`. |
| Painel por material/bairro → acessos por hora | 13–14/11/2026 (`59fce6a`, `d21ba50`) | O modelo de dados não tem bairro nem tabela de materiais; a ONG pediu visibilidade de uso dos pontos. É uma entrega diferente da história #10, não a mesma. |
| Deploy em VPS → adiado | 30/10/2026 | Sem URL pública até 14/11. O README ainda promete "Sprint 4". |
| Fechamento semestral com iteração extra pós-E8 | 31/10–14/11/2026 | O MVP funcional só ficou demonstrável depois da data oficial da E8; a iteração de estabilização está documentada em `pos-e8/`. |

## 3. Critérios de pronto do MVP (E2b) — conferência

| Critério aceito na E2b | Atendido? | Observação |
|---|---|---|
| Usuário e ONG logam com perfis e permissões diferentes | **Sim** | `user.ong`; rotas de moderação exigem `is_ong()`. |
| Sistema de mapa via OpenStreetMap | **Sim** | Leaflet + tiles OpenStreetMap. |
| Fluxo completo de cadastro e aprovação do ponto | **Parcial** | Cadastro → pendente → aprovação funciona; rejeição não. |
| Painel administrativo com dados reais agregados por material | **Parcial** | Há painel com dados reais, mas agregados por acesso/hora, não por material/bairro. |
| Sistema publicamente acessível por URL | **Não** | Nenhum deploy publicado. |
| README permite subir o projeto do zero | **Sim, com ressalvas** | O README cobre instalação, variáveis e testes; a URL da API é fixa e não há `.env.example`. |

## 4. Leitura honesta do resultado

O produto tem um MVP funcional e demonstrável localmente: autenticação,
mapa, cadastro colaborativo, moderação por aprovação, relatos, estatísticas
de acesso e PWA. Ele **não** atende integralmente ao escopo aceito na E2b:
faltam deploy público, rejeição de pontos, protocolo de relato, edição pela
interface, exportação CSV, dicas e o painel agregado por material/bairro.
Também não atende ao requisito mínimo de "6+ entidades com relacionamento
N:N" do Manual, porque o schema vigente tem quatro tabelas.

Essas reduções não foram decididas em uma retrospectiva formal antes da
Semana 10; elas aconteceram por priorização de estabilização e segurança.
O registro correto, portanto, é **redução de escopo não negociada
formalmente**, e não "entrega completa". A E10a lista item a item.
