# Rastreabilidade - RP Recicla

**Equipe:**
- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

**Trilha:** B

**Data:** 15/09/2026

A cadeia de rastreabilidade continua sendo funcional: História → Caso de Uso → Entidade → Tabela → Teste.

A implementação ocorre no mesmo repositório, mas é dividida entre dois projetos. A coluna "Código" fica em aberto até a implementação e será preenchida, a partir da E5, com o link da PR/arquivo e, quando útil, com a indicação do projeto (`webapp` ou `api`).

| História (E2) | Caso de uso (E3, uml.md) | Entidade(s) envolvida(s) | Tabela(s) (E3, schema.sql) | Caso de teste (E4, plano-de-testes.md) | Projeto primário | Código |
|---|---|---|---|---|---|---|
| #1 | Criar conta | Usuario | `usuario` | CT01 | `api` + `webapp` | — |
| #2 | Recuperar senha | Usuario | `usuario` | CT02 | `api` + `webapp` | — |
| #3 | Cadastrar ponto de coleta inicial | PontoDeColeta, MaterialAceito, HorarioFuncionamento | `ponto_coleta`, `ponto_material`, `horario_funcionamento` | CT03 | `api` + `webapp` | — |
| #4 | Consultar pontos no mapa | PontoDeColeta | `ponto_coleta` | CT04 | `api` + `webapp` | — |
| #5 | Visualizar detalhes do ponto | PontoDeColeta, HorarioFuncionamento, MaterialAceito | `ponto_coleta`, `horario_funcionamento`, `ponto_material`, `material_aceito` | CT05 | `api` + `webapp` | — |
| #6 | Cadastrar novo ponto de coleta / Registrar requisição pendente | RequisicaoCadastro | `requisicao_cadastro` | CT06 | `api` + `webapp` | — |
| #7 | Analisar requisições / Aprovar / Rejeitar / Registrar justificativa | RequisicaoCadastro, PontoDeColeta | `requisicao_cadastro`, `ponto_coleta` | CT07, CT08 | `api` + `webapp` | — |
| #8 | Relatar problema em ponto | RelatoProblema | `relato_problema` | CT09 | `api` + `webapp` | — |
| #9 | Editar ponto e horários | PontoDeColeta, HorarioFuncionamento | `ponto_coleta`, `horario_funcionamento` | CT10 | `api` + `webapp` | — |
| #10 | Visualizar painel agregado | PontoDeColeta, MaterialAceito | `ponto_coleta`, `ponto_material`, `material_aceito` (GROUP BY bairro/material) | CT11 | `api` + `webapp` | — |
| #11 | Exportar relatório CSV | mesmas de #10 | mesmas de #10 | CT12 | `api` + `webapp` | — |
| #12 | Visualizar dicas de separação | — (nenhum caso de uso de ONG "cadastra dica" foi modelado) | **sem tabela no schema atual** | CT13 | `webapp` / `api` se posteriormente necessário | — |

## Observação

A divisão entre `webapp` e `api` ocorre dentro do mesmo repositório. Ela não altera os casos de uso, entidades ou tabelas especificados; apenas define onde cada responsabilidade de implementação será mantida.
