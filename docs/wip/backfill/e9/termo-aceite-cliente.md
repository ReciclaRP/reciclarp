# Termo de Aceite do Cliente — ReciclaRP

**Cliente/PO:** Heitor Benedetti Lopes — Product Owner da equipe (RA 2840482421003)
**Data:** 14/11/2026
**Local:** Fatec Ribeirão Preto — ambiente local (`localhost`), branch `semana/7`, commit `ca01c0c`
**Acompanharam o teste:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes (RA 2840482421003) e Victor Breno Anastácio de Matos (RA 2840482313038)
**Evidência da bateria:** [`relatorio-testes-final.md`](relatorio-testes-final.md)
**Escopo de comparação:** [`docs/TermoAceite.pdf`](../../../TermoAceite.pdf) (E2b, 28/08/2026) e [`backlog-atualizado.md`](../backlog-atualizado.md)

> **Natureza deste aceite.** Não houve participação de cliente externo nem de uma
> ONG parceira. O papel de cliente foi exercido pelo PO da própria equipe, de
> forma declarada. Este documento **não substitui** um aceite de cliente real: ele
> registra o que a equipe consegue comprovar e o que ainda depende de validação
> externa. A assinatura ao final está pendente; o arquivo é uma minuta para
> revisão e coleta de assinatura.

## 1. Escopo avaliado (comparado ao Termo de Aceite do Projeto — E2b)

### 1.1 Funcionalidades Must + Should aceitas na E2b

| # | Funcionalidade aceita na E2b | Entregue? | Observação do PO |
|---|---|---|---|
| 1 | Cadastro e autenticação de usuários em perfil comum e de ONG | **Sim, com mudança de mecanismo** | Não há senha: cadastro e login são o mesmo fluxo de código de uso único (OTC) de seis dígitos. Perfis distintos são garantidos por `user.ong`; rotas de moderação exigem conta ONG. Testado em `api/tests/auth.test.js` e `webapp/tests/index-page.test.js`. |
| 2 | Recuperação de senha por e-mail | **Substituído por design** | Como todo acesso é um código de uso único, não existe senha a recuperar. O código expira em 15 minutos (`RECICLA_OTC_DURATION`). Não há link de redefinição. |
| 3 | Cadastro inicial de pontos de coleta pela ONG | **Sim** | Oito ecopontos semeados em `api/src/db/schema.js`; conta ONG cria ponto já aprovado. Cadastro pela tela `point-create.html`, com latitude e longitude digitadas manualmente. |
| 4 | Consulta de pontos de coleta próximos em mapa interativo | **Parcial** | Mapa Leaflet/OpenStreetMap funciona e exibe apenas pontos aprovados, mas não usa a localização do usuário nem ordena por distância. Abre fixo em Ribeirão Preto (`-21.1684, -47.8109`). |
| 5 | Visualização de detalhes do ponto (horário e materiais aceitos) | **Parcial** | O popup mostra descrição, horário e materiais. O rótulo "Aberto" é fixo e não compara o horário atual com `time_open`/`time_close`. |
| 6 | Cadastro colaborativo de novos pontos por usuários comuns | **Sim** | Cidadão cria ponto com `approved = 0`; ONG cria aprovado. Defeito conhecido: o checkbox de material biológico envia o valor de papel (`webapp/src/point-create.html.js`). |
| 7 | Fluxo de aprovação/rejeição de requisições pela ONG | **Parcial** | Aprovação funciona pela API e pelo portal da ONG. **Rejeição com justificativa não existe** e o autor não recebe aviso. |
| 8 | Relato de problemas em pontos já cadastrados | **Parcial** | Três categorias, gravação no banco e vínculo ao ponto. **Não gera protocolo, não tem status e a ONG não tem tela de listagem.** |
| 9 | Edição de horários e informações de pontos existentes pela ONG | **Parcial** | `POST /point/update` existe, é restrito a ONG e está testado. Nenhuma tela do webapp consome a rota; não há histórico de alteração. |
| 10 | Painel administrativo com total de pontos ativos agrupados por material | **Não** | O painel existe, mas mostra tabela de pontos, contagem de acessos e gráfico de acessos por hora. Não agrega por material nem por bairro. É uma entrega diferente da história #10. |
| 11 | Exportação do relatório do painel em CSV | **Não** | Não há botão nem rota de exportação. |

### 1.2 Critérios de pronto do MVP (E2b)

| Critério aceito na E2b | Atendido? | Observação do PO |
|---|---|---|
| Usuário e ONG logam com perfis e permissões diferentes | **Sim** | `user.ong` e `is_ong()`; testado em `security.regression.test.js` e `points.test.js`. |
| Sistema de mapa via OpenStreetMap | **Sim** | Leaflet com tiles do OpenStreetMap. |
| Fluxo completo de cadastro e aprovação do ponto | **Parcial** | Cadastro → pendente → aprovação funciona; rejeição não existe. |
| Painel administrativo exibe dados reais agrupados por material | **Não** | Dados reais existem, mas a agregação é por acesso/hora, não por material. |
| Sistema publicamente acessível por URL | **Não** | Nenhum deploy foi publicado; todos os testes foram em `localhost`. |
| README permite a um terceiro subir o projeto do zero | **Sim, com ressalvas** | Cobre instalação, variáveis e testes. Ressalvas: URL da API fixa em `webapp/src/logic/backend.js`, ausência de `.env.example` e de passo de deploy. |

## 2. Ressalvas / pendências

### 2.1 Bloqueantes para considerar o MVP completo nos termos da E2b

1. **Deploy público ausente.** É critério explícito da E2b. Sem URL, não há como
   validar o sistema em ambiente real nem cumprir o aceite integral.
2. **Rejeição de ponto inexistente.** O fluxo aceito fala em "aprovação/rejeição";
   só a aprovação foi entregue.
3. **Painel não agrega por material.** O critério "dados reais agrupados por
   material" não é atendido; o painel atual mede acessos por hora.
4. **Exportação CSV não entregue** (item Should do escopo aceito).

### 2.2 Não bloqueantes, mas registradas

5. **Edição de ponto sem interface.** A rota existe, mas a ONG não consegue editar
   pela tela.
6. **Relato sem protocolo nem acompanhamento.** O dado é gravado; o cidadão não
   recebe retorno e a ONG não vê a fila de relatos.
7. **Consulta sem geolocalização/ordenação por distância.**
8. **"Dicas de reciclagem" sem conteúdo.** O item de menu existe, mas o link é
   `href="#"`.
9. **Seis ou mais entidades com N:N não atendidas literalmente.** O schema tem
   quatro tabelas (`user`, `point`, `report`, `access`); `access` é uma associação
   N:N com atributo, mas o requisito numérico do Manual não é cumprido.
10. **Segurança em aberto.** SEC-001, SEC-002 e SEC-003 foram corrigidos em
    14/11/2026. SEC-004 a SEC-015 seguem abertos, com 12 testes `skip` que
    descrevem o comportamento seguro esperado. Destaque para SEC-013 (XSS
    armazenado em horários, severidade alta) e SEC-008 (token de escalação
    autogerado e impresso no log).
11. **Defeitos de UI conhecidos.** Checkbox biológico envia papel; dois links
    apontam para `/account-settings.html`, que não existe; o gráfico da ONG omite
    os rótulos de 18h e 22h.
12. **Autoria e RA.** O histórico Git é de autoria única (`HLRangel`); Adrian e
    Victor não têm commits assinados no período. O RA de Adrian diverge entre os
    PDFs (`2840484221051`) e os Markdown (`2840482421051`).
13. **Aceite externo ausente.** Não houve sessão com ONG ou cliente real; este
    aceite é interno.

## 3. Parecer

- [ ] Aceito sem ressalvas
- [x] **Aceito com ressalvas** — para fins de demonstração acadêmica, condicionado
      à resolução dos itens 2.1. O aceite do MVP, nos termos da E2b, **permanece
      pendente** até a publicação do deploy e a conclusão dos itens 1 a 4.
- [ ] Não aceito — motivo: […]

**Justificativa do parecer.** O produto é demonstrável de ponta a ponta no fluxo
principal (login → mapa → detalhes → relato → cadastro colaborativo → aprovação
pela ONG → estatísticas) e a suíte ativa está verde em execução isolada de cada
suíte: 222 testes, 208 passando, 12 `skip` de segurança declarada, 2 `todo` de
defeitos declarados e **0 falhas**. Isso
sustenta um aceite com ressalvas para a entrega da disciplina. Não sustenta,
porém, declarar o MVP da E2b como integralmente concluído: três itens do escopo
aceito não foram entregues (rejeição, painel por material e CSV), outros ficaram
parciais (edição pela interface, protocolo de relato e consulta por distância) e
o critério de deploy público não foi cumprido.

**Condições para converter em aceite sem ressalvas:**

1. Publicar o sistema em URL estável e repetir o roteiro do §5 do relatório de
   testes nessa URL.
2. Implementar rejeição com justificativa e aviso ao autor.
3. Entregar o painel agregado por material (ou renegociar formalmente o critério
   com o professor, por escrito).
4. Entregar a exportação CSV ou removê-la formalmente do escopo aceito.
5. Corrigir os três defeitos de UI e decidir, com o professor, quais SEC-xxx
   abertos são aceitáveis para o semestre.

## 4. Assinaturas

| Papel | Nome | RA | Assinatura | Data |
|---|---|---|---|---|
| Cliente/PO | Heitor Benedetti Lopes | 2840482421003 | _______________________ | ____/____/______ |
| Integrante | Adrian Souza Teixeira | 2840482421051 | _______________________ | ____/____/______ |
| Integrante | Victor Breno Anastácio de Matos | 2840482313038 | _______________________ | ____/____/______ |
| Cliente externo / ONG (opcional) | _______________________ | — | _______________________ | ____/____/______ |
| Professor responsável (ciência) | _______________________ | — | _______________________ | ____/____/______ |

**Forma de assinatura prevista:** física ou digital em PDF. Enquanto este arquivo
estiver em Markdown, sem assinatura e sem PDF anexo, ele é uma **minuta de
aceite**, não um aceite formalizado.

## 5. Como reproduzir a avaliação

```bash
# 1. Suítes automatizadas
cd api && npm test                 # 91 testes: 79 passam, 12 skip, 0 falham
cd ../webapp && npx vitest run     # 131 testes: 129 passam, 2 todo, 0 falham

# 2. Ambiente local
cd api && npm run dev              # sem RECICLA_RESEND_SECRET: códigos no log
cd webapp && npm run dev           # abrir a URL exibida pelo Vite

# 3. Roteiro manual
# Seguir os nove passos do §5 de relatorio-testes-final.md.
```

**Observação sobre rate limits:** `/auth/login`, `/point/create` e
`/point/update` aceitam 1 requisição a cada 2 minutos por IP; `/auth/token`
aceita 1 por minuto. Ao repetir o roteiro, reinicie a API ou aguarde a janela.
