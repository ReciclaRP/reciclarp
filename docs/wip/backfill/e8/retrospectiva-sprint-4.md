# Ata de Retrospectiva — Sprint 4 — ReciclaRP

**Data:** 30/10/2026
**Presentes:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Reconstruída em:** 14/11/2026

## 1. Ações da retrospectiva anterior — foram aplicadas?

| Ação decidida na Sprint 3 | Aplicada? | Evidência/comentário |
|---|---|---|
| Conectar mapa, popup e "Abrir no Maps" | **Sim** | `c862ee9`, `94cb493`, `036d027`, `d21944b`. |
| Implementar criação de ponto na API | **Não** | Só em 09/11 (`e9a8be6`). |
| Implementar aprovação e portal da ONG | **Não** | Tabela em 04/11; aprovação em 13/11. |
| Escrever testes de API e webapp | **Não** | Suítes só em 09/11. |

## 2. O que funcionou bem

- O mapa com Leaflet e os popups foram a entrega mais convincente do semestre;
  a integração com a API funcionou sem mock.
- O fluxo de login no navegador ficou completo, incluindo cookies e
  redirecionamento.
- O modo convidado (OTC no log) permitiu testar sem depender de e-mail real.
- A página de relato pré-preenchida melhorou a usabilidade.

## 3. O que não funcionou

- **O MVP não foi atingido na data da E8.** Faltavam criação de ponto,
  aprovação, painel da ONG, testes e deploy.
- O portal da ONG ainda era uma tabela vazia; a moderação não podia ser
  demonstrada.
- Nenhum teste automatizado de comportamento foi escrito em quatro sprints.
- A auditoria de segurança não foi feita; depois revelou bypass crítico
  (SEC-001/SEC-002).
- O deploy, prometido para esta sprint, não foi iniciado.

## 4. Ações para a iteração de estabilização (31/10–14/11)

| Ação | Responsável | Verificação |
|---|---|---|
| Implementar API e tela de criação de ponto | Heitor | `b8b79af`, `e9a8be6`, `dfa370f` |
| Popular o portal da ONG e implementar aprovação/remoção | Heitor | `7a1510a`, `7a571fa`, `6f63882`, `3169e18` |
| Escrever suítes de API e webapp | Victor | `7e211d0`, `256839b`, `ca01c0c` |
| Auditar e corrigir segurança | Heitor | `57f7870`, `c9ea037`; SEC-001/002/003 fechados |
| Rastreamento de acessos e gráfico | Heitor | `10276a8`, `59fce6a`, `d21ba50` |
| Publicar deploy | Adrian | **Não aplicada** — segue pendente |

## 5. Comentário de encerramento

A Sprint 4 foi a sprint mais produtiva em funcionalidade visível e, ao mesmo
tempo, a que expôs o descompasso entre o backlog e a realidade. A decisão da
equipe foi não declarar MVP e abrir uma iteração extra, em vez de apresentar
um produto incompleto como pronto. Essa decisão foi correta, mas deveria ter
sido negociada formalmente com o professor antes da Semana 10.
