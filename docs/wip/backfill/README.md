# Backfill das entregas E4–E10 — ReciclaRP

**Data de reconstrução:** 14/11/2026
**Repositório:** https://github.com/ReciclaRP/reciclarp
**Branch de referência:** `semana/7` (commit `ca01c0c`)
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Trilha:** B

## 1. Por que este diretório existe

O repositório tinha, até esta data, os artefatos da E1 (Documento de Visão),
E2 (Backlog e Termo de Aceite), E3 (UML, DER e DDL) e parte da E4 (README,
Plano de Testes e Roteiro do Protótipo). Não existiam os documentos de
acompanhamento das sprints (E5–E8), o relatório final de testes (E9), o Termo
de Aceite do Cliente (E9) nem os documentos de fechamento (E10).

Este diretório reconstrói esses artefatos em Markdown, a partir de evidência
verificável do próprio repositório: histórico Git, código em `api/src` e
`webapp/src`, suítes `api/tests` e `webapp/tests`, `README.md`, documentos
acadêmicos já existentes e `docs/agent-docs/`.

Os textos **não substituem** os arquivos oficiais que já estão em `docs/`.
Eles são uma proposta de backfill, para revisão humana antes de qualquer
promoção para os caminhos definitivos. Isso segue o contrato de `AGENTS.md`:
agentes podem escrever em `docs/wip/`, mas não editar documentos acadêmicos
oficiais nem código de aplicação.

## 2. Como ler os documentos

- **Datas:** cada relatório de sprint cobre o período oficial da sprint
  (18/09, 02/10, 16/10 e 30/10). Como a reconstrução foi feita depois, todo
  documento traz a data de reconstrução e não finge ter sido escrito no dia.
- **Fonte de verdade:** o código e os testes. Quando um requisito do backlog
  não foi entregue, o documento registra a pendência em vez de descrevê-lo
  como pronto.
- **Evidência Git:** os commits citados existem no histórico. O histórico é
  de autoria única (`HLRangel`); a limitação está registrada nos relatórios
  individuais e no §5.
- **Contagens de teste:** aferidas em 14/11/2026 na branch `semana/7`:
  API com **91 testes (79 passam, 12 pulados, 0 falham)** e webapp com
  **131 testes (129 passam, 2 `todo`, 0 falham)**. Os 12 pulados da API são
  dívida de segurança declarada em `docs/agent-docs/security.md`.

## 3. Estado real do produto em 14/11/2026

### O que funciona de ponta a ponta

- Login por código de uso único (OTC) de seis dígitos, com criação automática
  de conta no primeiro acesso e sessão em cookie.
- Mapa Leaflet/OpenStreetMap com os oito ecopontos reais de Ribeirão Preto
  semeados no banco, exibindo apenas pontos aprovados.
- Popup com descrição, horário e materiais aceitos; link para abrir no Google
  Maps e registro de acesso por usuário logado.
- Cadastro colaborativo de ponto por cidadão (nasce pendente) e cadastro
  direto por conta ONG (nasce aprovado).
- Portal da ONG com tabela de pontos, aprovação, remoção, contagem de acessos
  e gráfico de acessos por hora.
- Relato de problema em ponto, com três categorias.
- Logout, deleção de conta, resgate de código para promoção a ONG e manifesto
  PWA instalável.
- Limites de requisição por IP nas rotas sensíveis.

### O que não foi entregue ou ficou parcial

| Item do escopo original | Estado em 14/11/2026 |
|---|---|
| Deploy público por URL | **Não entregue.** Não há URL de produção no repositório; o README ainda diz "planejado para a Sprint 4". |
| Rejeição de ponto com justificativa | **Não entregue.** Existe aprovação (`/point/approve`), mas não rejeição. |
| Protocolo e acompanhamento de relato | **Não entregue.** O relato é gravado, mas não gera protocolo nem status. |
| Edição de ponto pela interface | **Parcial.** `POST /point/update` existe e é testado, mas nenhuma tela do webapp o consome. |
| Painel agregado por material/bairro | **Reinterpretado.** O painel mostra tabela de pontos e acessos por hora; não agrega por material nem por bairro. |
| Exportação CSV | **Não entregue.** |
| Ordenação por distância e geolocalização | **Não entregue.** O mapa abre centralizado em Ribeirão Preto, sem usar a posição do usuário. |
| Dicas de separação | **Parcial.** Há um item de menu "Dicas de reciclagem" sem página de conteúdo. |
| 6+ entidades com N:N | **Não atendido literalmente.** O schema vigente tem quatro tabelas (`user`, `point`, `report`, `access`); `access` funciona como associação N:N com atributo (hora), mas não há seis entidades. |
| Notificação push/SMS | Fora de escopo desde a E1; permanece `Won't`. |

### Riscos e dívidas declarados

- **Segurança:** SEC-001, SEC-002 e SEC-003 corrigidos em 14/11; SEC-004 a
  SEC-015 seguem abertos, com testes pulados que descrevem o comportamento
  seguro esperado (`api/tests/security.regression.test.js`).
- **Defeitos conhecidos de UI:** o checkbox de material biológico envia o
  valor de papel (`webapp/src/point-create.html.js`); dois links apontam para
  `/account-settings.html`, que não existe; o gráfico da ONG omite os rótulos
  de 18h e 22h.
- **Autoria:** todos os commits do período estão sob `HLRangel`. Os relatórios
  individuais de Adrian e Victor registram essa limitação e pedem evidência
  complementar (pair programming, atas, prints, PRs em outro fork).
- **RA divergente:** os PDFs da E1/E2 trazem `2840484221051` para Adrian,
  enquanto os Markdown da E3/E4 trazem `2840482421051`. Este backfill usa o
  valor dos Markdown; a divergência precisa ser resolvida pela equipe.

## 4. Mapa dos arquivos

| Entrega | Arquivo | Conteúdo |
|---|---|---|
| E4a | [`e4/e4a-readme-conformidade.md`](e4/e4a-readme-conformidade.md) | Conferência do README contra a rubrica da E4 |
| E4b | [`e4/e4b-plano-de-testes.md`](e4/e4b-plano-de-testes.md) | Plano de testes revisado para o sistema real |
| E4c | [`e4/e4c-prototipo.md`](e4/e4c-prototipo.md) | Roteiro do protótipo com mapeamento para a implementação |
| E5 | [`e5/`](e5/) | Relatório, retrospectiva, evidências e contribuições da Sprint 1 |
| E6 | [`e6/`](e6/) | Relatório, retrospectiva, evidências e contribuições da Sprint 2 |
| E7 | [`e7/`](e7/) | Relatório, retrospectiva, evidências e contribuições da Sprint 3 |
| E8 | [`e8/`](e8/) | Relatório, retrospectiva, evidências e contribuições da Sprint 4 |
| Pós-E8 | [`pos-e8/relatorio-estabilizacao.md`](pos-e8/relatorio-estabilizacao.md) | Iteração de estabilização que produziu o MVP real |
| E9a | [`e9/relatorio-testes-final.md`](e9/relatorio-testes-final.md) | Bateria final consolidada |
| E9b | [`e9/termo-aceite-cliente.md`](e9/termo-aceite-cliente.md) | Aceite do cliente/PO, com ressalvas |
| E10a | [`e10/documentacao-final.md`](e10/documentacao-final.md) | Índice consolidado e desvios de escopo |
| E10b | [`e10/manual-do-usuario.md`](e10/manual-do-usuario.md) | Manual do usuário por perfil |
| E10c | [`e10/roteiro-apresentacao.md`](e10/roteiro-apresentacao.md) | Roteiro do vídeo e do pitch |
| Apoio | [`backlog-atualizado.md`](backlog-atualizado.md) | Backlog com estado real por história |
| Apoio | [`rastreabilidade-atualizada.md`](rastreabilidade-atualizada.md) | História → caso de uso → tabela → código → teste |

## 5. Limitações desta reconstrução

1. **Não há atas externas nem gravações de Sprint Review.** Os relatórios
   registram revisão interna da equipe; não inventam participação do professor.
2. **Não há deploy públicos.** Nenhum documento simula URL de produção. O
   critério "Deploy público por URL" continua sendo o principal bloqueio de
   aceite do MVP.
3. **Não há evidência de commits de Adrian e Victor.** Os relatórios
   individuais deles são formulários preenchidos com o papel declarado e com
   um campo explícito de evidência complementar, não com commits fictícios.
4. **Os documentos de sprint usam os IDs de caso de teste do plano revisado
   da E4b.** O plano original (CT01–CT13) foi escrito antes da mudança para
   OTC/SQLite; a revisão preserva os IDs e registra a adaptação.
5. **A branch `semana/7` ainda não foi integrada em `main`.** O fechamento
   pressupõe o merge e a execução do CI em `main`.

## 6. Próximos passos para promoção

1. Revisar este diretório com o PO e o professor.
2. Resolver a divergência de RA e a ausência de commits de dois integrantes.
3. Publicar o deploy e atualizar `README.md` e a E10a com a URL real.
4. Corrigir os defeitos de UI e fechar (ou aceitar formalmente) os SEC-xxx
   abertos.
5. Copiar os arquivos aprovados para os caminhos oficiais
   (`docs/sprints/`, `docs/relatorio-testes-final.md`, etc.) **por uma pessoa
   mantenedora**, conforme `AGENTS.md`.
