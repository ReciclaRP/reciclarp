# Plano de Testes - RP Recicla

**Equipe:**
- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

**Trilha:** B

**Data:** 11/09/2026 (Revisão 1, 15/09/2026)

## 1. Estratégia

O sistema é mantido em um único repositório, organizado em dois projetos: `webapp` e `api`.

Os testes devem ser executados no projeto responsável pela camada que está sendo testada.

| Tipo de teste | O que cobre | Projeto | Ferramenta | Quando roda |
|---|---|---|---|---|
| Unitário | Regras de negócio isoladas | `api` | `node:test` + `node:assert` | A cada alteração relevante da API |
| Integração | Rotas da API e persistência | `api` | `node:test` + `fetch`/recursos de teste da API | A cada alteração de API |
| Manual/aceitação | Fluxo completo da aplicação web | `webapp` | Roteiro manual em planilha | Ao fim de cada sprint |

A arquitetura é de monorepo: não existem repositórios separados para `webapp` e `api`.

O `webapp` é uma PWA headless desenvolvida com Vite, sem React.

A `api` é desenvolvida em Node.js + Express.js.

## 2. Critério de bloqueio de merge

Nenhum PR deverá ser integrado em `main` se a suíte de testes correspondente à alteração falhar.

Para alterações da API, devem passar os testes unitários e de integração aplicáveis.

Para alterações da aplicação web, devem ser executados os testes automatizados disponíveis e o roteiro manual/aceitação aplicável.

## 3. Casos de teste planejados

Os casos de teste são critérios funcionais do sistema e podem envolver os dois projetos. A implementação de cada teste deverá ficar no projeto responsável pela camada testada.

| ID | História (E2) | Cenário | Entrada | Resultado esperado | Prioridade |
|---|---|---|---|---|---|
| CT01 | #1 | Cadastro com e-mail já existente | email já presente em `usuario` | Sistema recusa com mensagem clara (constraint UNIQUE + validação na API) | Alta |
| CT02 | #2 | Uso de link/código de redefinição de senha expirado | credencial de recuperação expirada | Sistema recusa e informa que a recuperação expirou | Média |
| CT03 | #3 | ONG cadastra ponto de coleta inicial | dados completos de endereço, bairro, horário e ao menos 1 material | Ponto é criado com `status = 'aprovado'` e aparece no mapa imediatamente | Alta |
| CT04 | #4 | Usuário consulta mapa | ao menos 1 ponto aprovado e 1 pendente no banco | Mapa lista só os pontos com `status = 'aprovado'`, ordenados por distância | Alta |
| CT05 | #5 | Usuário visualiza detalhes de um ponto fora do horário | horário cadastrado não cobre o momento da consulta | Tela indica "fechado no momento" | Média |
| CT06 | #6 | Usuário cadastra novo ponto de coleta | dados completos de um ponto ainda não mapeado | Cria registro em `requisicao_cadastro` com `status = 'pendente'`; ponto não aparece no mapa | Alta |
| CT07 | #7 | ONG rejeita requisição sem justificativa | rejeição enviada com campo de justificativa vazio | API recusa a operação (`CHECK` do banco + validação da API) | Alta |
| CT08 | #7 | ONG aprova requisição pendente | requisição válida, decisão = aprovar | Requisição muda para `aprovada`, gera ponto aprovado e registra decisor/data | Alta |
| CT09 | #8 | Usuário relata problema | categoria + descrição válidas | Registro é criado com protocolo único e status `aberto` | Média |
| CT10 | #9 | ONG edita horário inválido | fechamento anterior/igual à abertura | API recusa a alteração e informa o erro | Alta |
| CT11 | #10 | Painel agregado | vários pontos aprovados em bairros/materiais diferentes | API retorna totais agrupados por bairro e material | Alta |
| CT12 | #11 | Exportação do relatório | painel com dados | Usuário recebe CSV com os dados agregados | Média |
| CT13 | #12 | Visualizar dicas | dicas disponíveis | Aplicação exibe dicas curtas de separação | Baixa |

## 4. Responsabilidade por projeto

### API (`api`)

Responsável pelos testes de:
- regras de negócio;
- autenticação e autorização;
- validação de dados;
- rotas HTTP;
- integração com PostgreSQL;
- consultas e agregações;
- geração de respostas da API.

Os testes devem ser organizados dentro de `api/tests/` conforme a implementação.

### Aplicação web (`webapp`)

Responsável pelos testes e verificações de:
- navegação;
- formulários;
- consumo da API;
- apresentação dos dados;
- comportamento responsivo;
- instalação e comportamento básico da PWA;
- fluxos de aceitação definidos para cada história.

## 5. Observações

O protótipo registra uma decisão posterior de utilizar *one-time code* (OTC) para autenticação/recuperação. O teste CT02 permanece como requisito comportamental: uma credencial de recuperação expirada deve ser recusada. O mecanismo concreto pertence à `api`.
