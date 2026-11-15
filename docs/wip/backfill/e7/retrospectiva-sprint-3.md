# Ata de Retrospectiva — Sprint 3 — ReciclaRP

**Data:** 16/10/2026
**Presentes:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
**Reconstruída em:** 14/11/2026

## 1. Ações da retrospectiva anterior — foram aplicadas?

| Ação decidida na Sprint 2 | Aplicada? | Evidência/comentário |
|---|---|---|
| Fechar a seed com os oito ecopontos | **Sim** | `a1622b2` e `4315891`; `__RECICLA_POINT_SEED`. |
| Implementar endpoints e conectar o mapa | **Parcial** | Login e `/point/list` prontos; mapa conectado só em 19/10. |
| Criar testes de API para auth e pontos | **Não** | Nenhum teste novo; suíte só em 09/11. |
| Revisar plano de testes e DER para SQLite/OTC | **Não** | Revisão só em 14/11 (E4b e E10a). |

## 2. O que funcionou bem

- A seed com os oito ecopontos reais deu ao projeto uma base crível para
  demonstração e testes manuais.
- O CLI foi útil para exercitar login e listagem sem depender do frontend.
- O schema de pontos ficou estável e não precisou de mudança estrutural
  relevante depois desta sprint.
- A API de login amadureceu (correções de sintaxe, expiração de código).

## 3. O que não funcionou

- O mapa continuou sem dados no navegador; a conexão frontend/backend era a
  tarefa mais importante e não entrou.
- A aprovação de pontos, coração do fluxo da ONG, não foi iniciada.
- Nenhum teste automatizado novo; o CI continuava cobrindo só fumaça.
- O DER e o plano de testes continuaram falando de PostgreSQL e senha.

## 4. Ações para a próxima sprint

| Ação | Responsável | Verificação na Sprint 4 |
|---|---|---|
| Conectar mapa, popup e "Abrir no Maps" | Heitor | `c862ee9`, `94cb493`, `036d027`, `d21944b` |
| Implementar criação de ponto na API | Heitor | Só em 09/11 (`e9a8be6`), fora da Sprint 4 |
| Implementar aprovação e portal da ONG | Adrian | Tabela em 04/11; aprovação em 13/11 |
| Escrever testes de API e webapp | Victor | **Não aplicada** até 09/11 |

## 5. Comentário de encerramento

A sprint entregou dados e backend, mas não entregou o fluxo que a banca
consegue ver. O projeto chegou ao fim da Sprint 4 ainda sem aprovação e sem
testes, o que empurrou o MVP real para a iteração de estabilização.
