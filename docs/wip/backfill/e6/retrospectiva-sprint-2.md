# Ata de Retrospectiva — Sprint 2 — ReciclaRP

**Data:** 02/10/2026
**Presentes:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Reconstruída em:** 14/11/2026

## 1. Ações da retrospectiva anterior — foram aplicadas?

| Ação decidida na Sprint 1 | Aplicada? | Evidência/comentário |
|---|---|---|
| Fechar o schema SQLite (4 tabelas) e a seed | **Parcial** | Schema fechado; seed ainda em rascunho em `db/seed_draft.txt`. |
| Configurar Vitest no webapp e CI | **Sim** | `6764a77` e `f7b52c5`, em 22/09. |
| Escrever testes de integração de auth | **Não** | Nenhum teste de auth foi criado; a suíte só chegou em 09/11. |
| Reduzir o escopo da Sprint 2 para layout + infraestrutura | **Sim** | Entregas de 21–24/09 foram todas de interface. |
| Registrar OTC no protótipo/README | **Sim** | `docs/prototipo.md` e README atualizados. |

## 2. O que funcionou bem

- O layout avançou rápido: em quatro dias úteis, todas as páginas principais
  ganharam estrutura, top bar, ícones e CSS externo.
- O CI entrou cedo o suficiente para ser usado nas sprints seguintes.
- A separação em páginas independentes (`map.html`, `menu.html`,
  `ong-menu.html`) facilitou dividir o trabalho de UI.

## 3. O que não funcionou

- **Interface sem contrato de API.** As telas foram desenhadas antes dos
  endpoints; o mapa ficou sem dados e o formulário de sugestão só imprimia no
  console.
- O teste de fumaça do Vitest não cobria nenhuma página; o CI verde dava uma
  falsa sensação de cobertura.
- A seed continuou em rascunho, então não havia massa de dados para o mapa.
- A mudança para SQLite não foi refletida no plano de testes nem no DER.

## 4. Ações para a próxima sprint

| Ação | Responsável | Verificação na Sprint 3 |
|---|---|---|
| Fechar a seed com os oito ecopontos e testar o boot | Adrian | `api/src/db/schema.js` com `__RECICLA_POINT_SEED` |
| Implementar endpoints de login/listagem e conectar o mapa | Heitor | `c862ee9` e seguintes em 19/10 (já na Sprint 4) |
| Criar testes de API para auth e pontos | Victor | **Não aplicada** — suíte só em 09/11 |
| Revisar plano de testes e DER para SQLite/OTC | Todos | **Não aplicada** — revisão só em 14/11 |

## 5. Comentário de encerramento

A sprint cumpriu o objetivo de "reduzir escopo para layout + infraestrutura",
mas deixou a impressão de que o produto estava mais adiantado do que estava.
A lição — "não desenhar tela sem endpoint" — foi parcialmente aplicada na
Sprint 3, quando o login e a listagem começaram a ser conectados.
