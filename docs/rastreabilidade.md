# Rastreabilidade - RP Recicla

**Equipe:**

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

**Trilha:** B

**Data:** 10/09/2026

Cadeia completa. A coluna "Código" fica em aberto até a implementação (Sprint correspondente) e será preenchida com o link do PR/arquivo a partir da E5.

| História (E2) | Caso de uso (E3, uml.md) | Entidade(s) envolvida(s) | Tabela(s) (E3, schema.sql) | Caso de teste (E4, plano-de-testes.md) | Código (a partir da E5) |
|---|---|---|---|---|---|
| #1 | Criar conta | Usuario | `usuario` | CT01 | — |
| #2 | Recuperar senha | Usuario | `usuario` | CT02 | — |
| #3 | Cadastrar ponto de coleta inicial | PontoDeColeta, MaterialAceito, HorarioFuncionamento | `ponto_coleta`, `ponto_material`, `horario_funcionamento` | CT03 | — |
| #4 | Consultar pontos no mapa | PontoDeColeta | `ponto_coleta` | CT04 | — |
| #5 | Visualizar detalhes do ponto | PontoDeColeta, HorarioFuncionamento, MaterialAceito | `ponto_coleta`, `horario_funcionamento`, `ponto_material`, `material_aceito` | CT05 | — |
| #6 | Cadastrar novo ponto de coleta / Registrar requisição pendente | RequisicaoCadastro | `requisicao_cadastro` | CT06 | — |
| #7 | Analisar requisições / Aprovar / Rejeitar / Registrar justificativa | RequisicaoCadastro, PontoDeColeta | `requisicao_cadastro`, `ponto_coleta` | CT07, CT08 | — |
| #8 | Relatar problema em ponto | RelatoProblema | `relato_problema` | CT09 | — |
| #9 | Editar ponto e horários | PontoDeColeta, HorarioFuncionamento | `ponto_coleta`, `horario_funcionamento` | CT10 | — |
| #10 | Visualizar painel agregado | PontoDeColeta, MaterialAceito | `ponto_coleta`, `ponto_material`, `material_aceito` (GROUP BY bairro/material) | CT11 | — |
| #11 | Exportar relatório CSV | (mesmas de #10) | (mesmas de #10) | CT12 | — |
| #12 | Visualizar dicas de separação | — (nenhum caso de uso de ONG "cadastra dica" foi modelado) | **sem tabela no schema atual** | CT13 | — |
