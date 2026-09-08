# Plano de Testes - RP Recicla

**Equipe:** 

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

**Trilha:** B

**Data:** 11/09/2026

## 1. Estratégia
Sem dependências novas: os testes rodam com o que já vem no Node.js (test runner nativo `node:test` + `node:assert` + `fetch` nativo para chamar a API), organizados em um único script.

| Tipo de teste | O que cobre | Ferramenta | Quando roda |
|---|---|---|---|
| Unitário | Regras de negócio isoladas | `node --test` | A cada call da script de geração do relatório de testes |
| Integração | Rotas da API | Chamando a API com `fetch` | A cada call da script de geração do relatório de testes |
| Manual/aceitação | Fluxo completo no PWA antes de cada Sprint Review | Roteiro manual em planilha | Ao fim de cada sprint |

Estrutura do script: `backend/tests/*.test.js`, executado com `node --test backend/tests`. Sem framework, sem `package.json` de teste separado.

## 2. Critério de bloqueio de merge

Nenhum PR é aceito na `main` se `node --test` falhar.

## 3. Casos de teste planejados (cresce a cada sprint)
| ID | História (E2) | Cenário | Entrada | Resultado esperado | Prioridade |
|---|---|---|---|---|---|
| CT01 | #1 | Cadastro com e-mail já existente | email já presente em `usuario` | Sistema recusa com mensagem clara (constraint UNIQUE + validação na API) | Alta |
| CT02 | #2 | Uso de link de redefinição de senha expirado | link gerado há mais de 1h | Sistema recusa e informa que o link expirou | Média |
| CT03 | #3 | ONG cadastra ponto de coleta inicial | dados completos de endereço, bairro, horário e ao menos 1 material | Ponto é criado com `status = 'aprovado'` e aparece no mapa imediatamente | Alta |
| CT04 | #4 | Usuário consulta mapa | ao menos 1 ponto aprovado e 1 pendente no banco | Mapa lista só os pontos com `status = 'aprovado'`, ordenados por distância | Alta |
| CT05 | #5 | Usuário visualiza detalhes de um ponto fora do horário | horário cadastrado não cobre o momento da consulta | Tela indica "fechado no momento" | Média |
| CT06 | #6 | Usuário cadastra novo ponto de coleta | dados completos de um ponto ainda não mapeado | Cria registro em `requisicao_cadastro` com `status = 'pendente'`; ponto não aparece no mapa | Alta |
| CT07 | #7 | ONG rejeita requisição sem justificativa | rejeição enviada com campo de justificativa vazio | API recusa a operação (`CHECK` do banco + validação da API) | Alta |
| CT08 | #7 | ONG aprova requisição pendente | requisição válida, decisão = aprovar | `status` muda para `'aprovada'`, um `ponto_coleta` é gerado (`ponto_gerado_id` preenchido) e passa a aparecer no mapa | Alta |
| CT09 | #8 | Usuário relata problema em ponto existente | categoria + descrição preenchidas | Relato criado com protocolo único gerado pelo sistema | Média |
| CT10 | #9 | ONG edita horário de um ponto aprovado | novo horário de funcionamento | Alteração refletida imediatamente na consulta do usuário | Média |
| CT11 | #10 | Painel agregado por material e bairro | 3 pontos aprovados em 2 bairros distintos, materiais variados | Painel exibe contagem correta agrupada (GROUP BY bairro, material) | Alta |
| CT12 | #11 | Exportação do painel em CSV | painel já populado (cenário do CT11) | Arquivo CSV gerado com os mesmos totais exibidos na tela | Baixa |
| CT13 | #12 | Usuário acessa dicas de separação | menu de ajuda | Ao menos 4 dicas cadastradas pela ONG são exibidas | Baixa |
