# E4c — Roteiro do Protótipo Navegável (revisão)

**Entrega:** E4 (Roteiro do Protótipo)
**Data de referência:** 11/09/2026
**Revisão:** 14/11/2026
**Link do protótipo:** https://www.figma.com/design/VpJQCMN1ncZQrlraGeXbfb/Trabalho-do-Lucas?node-id=0-1&t=VMZweitYrp64vKfi-1
**Equipe:** Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes
(RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)

O protótipo foi feito antes da decisão por OTC e antes da migração para SQLite.
Esta revisão mantém os números de tela do arquivo original e acrescenta a
coluna **implementação atual**, para que a banca consiga comparar o desenho
com o sistema em execução. A versão oficial em `docs/prototipo.md` não tem
essa coluna e ainda lista telas que nunca existiram.

## 1. Mapa das telas

| Tela | Perfil | História (E2) | O que o protótipo mostra | Implementação atual | Estado |
|---|---|---|---|---|---|
| 1 | Todos | #1 Criar conta / login | Formulário de e-mail e senha | `index.html` + `src/index.html.js`: e-mail + OTC; não há senha | **Implementado com mudança de mecanismo** |
| 1 e 2 | Todos | #2 Recuperar senha | Link de redefinição | O próprio login por OTC cobre a recuperação; não há tela separada | **Substituído por design** |
| 3 | Cidadão | #4 Consultar mapa | Mapa com pins | `map.html` + `src/map.html.js`: Leaflet/OSM, oito ecopontos | **Implementado, sem geolocalização/ordenação por distância** |
| 3 | Cidadão | #5 Ver detalhes | Popup do ponto | `src/map.html.js`: popup com descrição, horário, materiais, "Abrir no Maps" e "Reportar Problema" | **Implementado; "Aberto" é fixo** |
| 4 | Cidadão | #8 Relatar problema | Formulário de relato | `user-report.html` + `src/user-report.html.js`: três categorias e descrição | **Implementado; sem protocolo/status** |
| 6 | Todos | #12 Dicas de separação | Tela de dicas | `menu.html`: item "Dicas de reciclagem" com `href="#"` | **Não implementado** |
| 8 | ONG | #7 Aprovar/rejeitar | Lista de requisições | `ong-menu.html` + `src/ong-menu.html.js`: tabela com pontos pendentes e link "Aprovar" | **Aprovação implementada; rejeição não** |
| 9 | ONG | #10 Painel | Tabela agregada | `ong-menu.html`: tabela de pontos, contagem de acessos e gráfico por hora | **Reinterpretado; não agrega por material/bairro** |
| 9 | ONG | #11 Exportar | Botão de exportação | Não existe botão nem endpoint | **Não implementado** |
| 10 | ONG | #3 Criar ponto | Formulário de ponto | `point-create.html` + `src/point-create.html.js`: descrição, lat/long, horário, quatro flags | **Implementado; aviso de autoaprovação para ONG** |
| 11 | ONG | #9 Editar ponto | Formulário de edição | API `POST /point/update`, sem tela | **Parcial (API apenas)** |
| 14 | Cidadão | #6 Sugerir ponto | Formulário de sugestão | `point-create.html` (mesmo formulário, `approved = 0`) | **Implementado** |
| — | Todos | #1 Sair | — | `user-settings.html`: "Terminar Sessão" | **Implementado** |
| — | Todos | Fluxo extra | — | `user-settings.html`: "Deletar Conta" e "Resgatar Código" | **Implementado** |

## 2. Fluxo navegável que a banca consegue reproduzir

1. Abrir `index.html` e pedir código para um e-mail.
2. Ler o código no log da API (modo convidado) e entrar.
3. No mapa, clicar em um marcador; o popup mostra horário, materiais e links.
4. Clicar em "Reportar Problema" e enviar um relato.
5. Voltar ao menu e abrir "Sugerir ponto"; preencher e enviar.
6. Entrar com a conta ONG (código especial em `user-settings.html`), abrir
   "Portal da ONG", aprovar o ponto pendente, ver a contagem de acessos e o
   gráfico por hora, e remover um ponto.
7. Encerrar a sessão.

## 3. Divergências entre protótipo e implementação

| Divergência | Motivo | Consequência |
|---|---|---|
| Senha → OTC | Decisão de 17–20/09 para reduzir risco e eliminar armazenamento de senha | Telas 1/2 foram fundidas; não há "esqueci a senha" |
| PostgreSQL/PostGIS → SQLite | Simplificação de infraestrutura | Não há consulta geoespacial; o mapa não ordena por distância |
| Tabela de materiais → flags no ponto | Redução do modelo para quatro tabelas | Não há agregação por material |
| Bairro → descrição livre | O schema não tem bairro | Não há agregação por região |
| Tela 11 (edição) nunca implementada | Prioridade em criação/aprovação | Só existe a rota de API |
| Telas 6 e 9 (dicas/exportação) nunca implementadas | Corte de escopo não formalizado | Itens #11 e #12 seguem pendentes |

## 4. Observações para a apresentação

- O protótipo continua útil para mostrar a **intenção de fluxo**; ele não deve
  ser apresentado como especificação executada.
- As telas de login e de criação de ponto são as que mais divergem: mostrar
  o sistema real, não o Figma, durante a demonstração.
- Os links para `/account-settings.html` em `menu.html` e `user-settings.html`
  são um defeito conhecido: a tela existente é `user-settings.html`. Não
  prometer uma tela de configurações que não existe.
