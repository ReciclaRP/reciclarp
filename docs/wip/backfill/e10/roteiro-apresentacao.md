# Roteiro de Apresentação — ReciclaRP

**Entrega:** E10c
**Data prevista na E10:** 13/11/2026 (Feira de Projetos) — roteiro reconstruído
em 14/11/2026
**Formato:** vídeo de demonstração de 3–5 min + pitch ao vivo de 10 min com 5 min
de perguntas
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

> **Condição de gravação.** Não há deploy público. O vídeo e o pitch devem ser
> gravados/executados **no ambiente local**. Se um deploy for publicado antes da
> apresentação, substitua as URLs e refaça a gravação; não apresente `localhost`
> como se fosse produção. Não há registro de que este roteiro já tenha sido
> executado.

## 1. Vídeo de demonstração (3–5 min)

| Tempo | Conteúdo | Quem narra |
|---|---|---|
| 0:00–0:30 | Problema: descarte irregular e informação dispersa sobre ecopontos em Ribeirão Preto. Público: moradores e ONGs que moderam pontos. | Victor |
| 0:30–1:00 | Entrada sem senha: e-mail → **Pedir Código** → código de seis dígitos → mapa. Mostrar que a conta nasce no primeiro acesso. | Adrian |
| 1:00–2:15 | Fluxo do cidadão: clique em um ecoponto, leitura de horário/materiais, **Abrir no Maps** (registro de acesso), **Reportar Problema** e **Sugerir ponto** (ponto nasce pendente e não aparece no mapa). | Heitor (narra) + Victor (opera a tela) |
| 2:15–3:15 | Fluxo da ONG: resgate do código especial, **Portal da ONG**, ponto pendente em amarelo, **Aprovar**, ponto no mapa, **Estatísticas** com acessos por hora, criação direta de ponto aprovado. | Adrian (narra) + Heitor (opera a tela) |
| 3:15–3:45 | Diferenciais técnicos: OTC sem senha; SQLite em arquivo único; 222 testes, 208 passando, 0 falhas; 12 `skip` que declararam dívida de segurança em vez de escondê-la. | Victor |
| 3:45–4:15 | Fechamento honesto: o que funciona, o que não foi entregue (deploy, rejeição, protocolo, CSV, painel por material) e onde está o repositório. | Heitor |

**Total previsto:** 4 min 15 s. Deixe 45 s de folga para não estourar 5 min.

### 1.1 Preparação da gravação

- [ ] API reiniciada com banco limpo e seed de oito ecopontos.
- [ ] Webapp rodando; aba anônima para o cidadão e janela normal para a ONG.
- [ ] Duas contas de teste já autenticadas **antes** de gravar, para não esbarrar
      no limite de 1 login por 2 minutos.
- [ ] Código especial de ONG em mãos (não mostrar o valor na tela).
- [ ] Um ponto de teste pendente já criado, para a aprovação ser imediata.
- [ ] Terminal da API fora do enquadramento ou com e-mails de teste, nunca reais.
- [ ] Resolução 1920×1080, fonte ampliada, notificações do sistema desligadas.
- [ ] Gravação de tela testada com áudio antes da tomada final.

### 1.2 Plano B

| Risco | Plano B |
|---|---|
| Rate limit ao pedir código | Usar sessões já autenticadas; não refilmar o login; inserir cartela com a tela de código. |
| API cai ou banco trava | Reiniciar a API e regravar o bloco; manter um vídeo de reserva gravado no dia anterior. |
| Chart.js não renderiza | Mostrar a tabela de acessos e explicar o gráfico; não inventar número. |
| Deploy publicado em cima da hora | Regravar apenas a abertura e o fechamento com a URL real. |

## 2. Pitch ao vivo (10 min + 5 min de perguntas)

| Bloco | Tempo | Quem fala | Conteúdo |
|---|---|---|---|
| Contexto e problema | 2 min | Victor | Descarte irregular, ecopontos pouco visíveis, contribuições sem canal de moderação. Apresentar o ReciclaRP como PWA de consulta e cadastro colaborativo. |
| Demonstração ao vivo | 4 min | Heitor (opera) + Adrian (narra) | Mesmo fluxo do vídeo, mais curto: login já feito → mapa → popup → relato → portal da ONG → aprovação → estatísticas. Se algo falhar, usar o vídeo de reserva sem pedir desculpas longas. |
| Decisões técnicas | 2 min | Adrian | Por que SQLite em vez de PostgreSQL/PostGIS; como o OTC elimina senha; por que os tokens ficam em memória; o que o schema de quatro tabelas modela. |
| Qualidade, segurança e desvios | 1 min | Victor | 222 testes, 0 falhas; 12 `skip` = dívida declarada; SEC-001/002/003 corrigidos; SEC-004 a SEC-015 abertos; reduções de escopo não negociadas formalmente. |
| Fechamento e próximos passos | 1 min | Heitor | Deploy, rejeição com justificativa, protocolo de relato, painel por material e CSV. Repositório e branch. |

**Regra de ouro:** todo integrante fala em pelo menos dois blocos. Nenhum bloco
é lido de papel; use cartões com 3–4 palavras-chave.

### 2.1 Divisão por integrante

| Integrante | Blocos | Mensagem que precisa ficar |
|---|---|---|
| Heitor (PO) | Demonstração + fechamento | O produto resolve o fluxo principal e a equipe sabe exatamente o que falta. |
| Adrian (dados) | Abertura do login + decisões técnicas | As escolhas de banco e autenticação foram conscientes, não acidentais. |
| Victor (qualidade) | Contexto + qualidade/segurança | A suíte é ampla, verde e honesta sobre o que não cobre. |

## 3. Perguntas antecipadas

| Pergunta provável | Quem responde | Resposta preparada |
|---|---|---|
| Por que SQLite e não PostgreSQL/PostGIS, como estava na E2b? | Adrian | O MVP roda em um único host e não precisa de concorrência nem de geoqueries. SQLite elimina serviço, credenciais e backup externo. Foi documentado em `docs/prototipo.md` (commit `e105325`), mas **não houve aceite formal do professor**; é um desvio declarado, não uma entrega equivalente. |
| O Manual exige 6+ entidades com N:N. Vocês têm quatro tabelas. | Adrian | Não atendemos literalmente. Temos `user`, `point`, `report` e `access`; `access` é uma associação N:N com atributo (hora), mas o número exigido não é atingido. Está registrado como desvio na E10a; não vamos inflar o modelo para cumprir número. |
| Cadê o deploy público? | Heitor | Não existe. É o principal bloqueio do aceite: todos os testes foram em `localhost`. O README ainda diz "planejado para a Sprint 4". Não vamos apresentar URL falsa. |
| Por que login por código em vez de senha? | Adrian | Elimina armazenamento de senha e une cadastro, login e recuperação. O custo é depender de e-mail e ter código de 15 minutos. A E2b previa senha; a mudança está documentada, mas não formalmente aceita. |
| A autenticação é segura? | Victor | As três falhas críticas de comparação frouxa (`==`) foram corrigidas e testadas em 14/11. Ainda há dívida: SEC-013 (XSS armazenado em horários) é alta e está aberta; SEC-008 imprime o código de ONG no log quando a variável não é definida. Os 12 testes `skip` descrevem exatamente esses buracos. |
| Por que 12 testes pulados se vocês dizem "0 falhas"? | Victor | `skip` não é falha: é teste escrito para o comportamento seguro que ainda não existe. Preferimos deixar a dívida visível a apagar o teste. Os 2 `todo` são defeitos de UI conhecidos: checkbox biológico e links quebrados. |
| O aceite do cliente foi real? | Heitor | Não. O aceite é interno, feito pelo PO da equipe, e está marcado como minuta sem assinatura. Não houve ONG nem cliente externo. O documento diz isso na primeira página. |
| O histórico Git tem commits de todos? | Victor | Não. Todo o período está sob `HLRangel` (Heitor). Adrian e Victor não têm commits assinados; os relatórios individuais pedem evidência complementar (pair programming, atas, PRs). Não inventamos commits. |
| Vocês cortaram escopo depois da Semana 10? | Heitor | Sim, e isso é o ponto mais frágil. O painel por material virou acessos por hora em 13–14/11, depois da janela de negociação. Rejeição, protocolo e CSV simplesmente não foram entregues. Registramos como redução **não negociada formalmente**, em vez de chamar de entrega completa. |
| O sistema aguenta muitos usuários? | Adrian | Não sabemos: não houve teste de carga. O rate limit é funcional, mas atrás de proxy compartilha o mesmo bucket (SEC-006). SQLite e tokens em memória limitam a implantação a um único processo. |
| Como fica a LGPD? | Victor | Coletamos apenas e-mail e dados do ponto; o relato fica vinculado à conta. Não há política de retenção nem exportação de dados do titular. É uma lacuna real para produção, embora o aviso na tela peça que não se insiram dados desnecessários. |
| O PWA funciona offline? | Victor | Não. É instalável, mas não tem service worker. A documentação e o manual dizem isso explicitamente. |
| O que vocês fariam diferente? | Heitor | Teríamos negociado o corte de escopo antes da Semana 10 e publicado um deploy mínimo cedo, para testar em URL real. Também teríamos dividido commits desde o início, para refletir a contribuição de cada um. |
| Qual é o próximo passo concreto? | Heitor | Publicar o deploy, implementar rejeição com justificativa, decidir com o professor o destino do painel por material e do CSV, corrigir os três defeitos de UI e fechar ou aceitar por escrito os SEC abertos. |

## 4. O que não fazer na apresentação

- Não dizer "está 100% pronto", "todos os requisitos foram atendidos" ou "o
  cliente aprovou".
- Não mostrar `localhost` como se fosse produção nem inventar URL.
- Não exibir o código especial de ONG, e-mails reais ou o terminal com segredos.
- Não esconder os `skip`/`todo`; eles são a prova de que a equipe sabe o que falta.
- Não atribuir a criação do MVP à Sprint 4: o incremento demonstrável é da
  iteração pós-E8 (31/10–14/11).
- Não prometer prazo de correção que a equipe não acordou.

## 5. Checklist final

- [ ] Vídeo com 3–5 min, áudio audível, sem dados pessoais.
- [ ] Link do vídeo testado em outro computador.
- [ ] Repositório aberto em aba separada: `https://github.com/ReciclaRP/reciclarp`.
- [ ] `docs/wip/backfill/e10/documentacao-final.md` e o relatório de testes à mão
      para citar números.
- [ ] Cronômetro visível para os 10 min.
- [ ] Cada integrante sabe responder às perguntas da sua área.
- [ ] Frase de encerramento combinada: o que o ReciclaRP entrega hoje e o que
      falta para o MVP completo.
