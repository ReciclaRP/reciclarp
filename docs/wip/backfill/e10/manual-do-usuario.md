# Manual do Usuário — ReciclaRP

**Versão:** 1.0 — 14/11/2026
**Público:** moradores de Ribeirão Preto (cidadãos) e organizações não
governamentais (ONGs) que moderam os pontos de coleta.
**Sistema:** aplicação web/PWA ReciclaRP, executada localmente nesta versão.

> **Sobre as imagens.** O manual foi escrito para o sistema real, mas **não há
> deploy público** e, portanto, não há capturas de tela de produção. Onde aparece
> `[captura: ...]`, a imagem deve ser produzida no ambiente local com o roteiro
> indicado e anexada antes da publicação. Nenhuma imagem foi simulada neste
> arquivo.

## Antes de começar

1. Peça à equipe o endereço do sistema. No ambiente local, o webapp é aberto na
   URL exibida pelo Vite (por padrão, `http://localhost:5173`) e a API responde em
   `http://localhost:3000`.
2. A API precisa estar rodando. Se ela estiver parada, o login e o mapa não
   carregam.
3. O sistema é uma **demonstração acadêmica**. Não insira dados pessoais reais
   além do necessário. A própria tela de login faz esse aviso.
4. Na configuração local sem chave de e-mail, o código de acesso **não chega por
   e-mail**: ele aparece no terminal da API. Isso é o "modo convidado" e serve
   apenas para testes.

## Para cidadãos

### Como criar minha conta e entrar

Não existe cadastro separado nem senha. A conta é criada automaticamente no
primeiro acesso com um código de uso único.

1. Abra a página inicial do ReciclaRP.
2. No campo de e-mail, digite seu endereço e clique em **Pedir Código**.
3. Se a API estiver em modo convidado, procure no terminal dela uma linha como
   `The login code for seu@email.com was 123456`. Se houver envio real, confira
   sua caixa de entrada.
4. Digite o código de seis dígitos no campo **Código de Verificação** e clique em
   **Entrar**.
5. Você é levado ao mapa.

[captura: tela inicial com e-mail preenchido, botão "Pedir Código" e campo de código]

**Atenção aos limites:** pedir código aceita **1 tentativa a cada 2 minutos** por
rede, e validar o código aceita **1 por minuto**. Se errar, espere a janela; não
adianta clicar repetidamente. O código expira em **15 minutos**.

### Como consultar os pontos de coleta no mapa

1. Depois do login, o mapa abre centralizado em Ribeirão Preto.
2. Cada marcador representa um ponto **aprovado**. Pontos ainda pendentes não
   aparecem.
3. Clique em um marcador para abrir o cartão do ponto.
4. O cartão mostra número, horário de funcionamento, endereço/descrição e os
   materiais aceitos.

[captura: mapa com marcadores e cartão de um ponto aberto]

**Limitações desta versão:** o mapa não usa sua localização e não ordena os
pontos por distância. O selo "Aberto" é fixo: ele **não** compara a hora atual com
o horário do ponto. Confira o horário exibido antes de sair de casa.

### Como abrir o ponto no Google Maps

1. No cartão do ponto, clique em **Abrir no Maps**.
2. O Google Maps abre com as coordenadas do ponto.
3. Se você estiver logado, essa ação registra uma visita ao ponto. O painel da
   ONG mostra apenas a contagem e a hora; seu e-mail não aparece na tela.

### Como sugerir um novo ponto de coleta

1. Abra o menu pelo ícone **☰** no topo e escolha **Sugerir ponto**.
2. Preencha a descrição/endereço. O sistema aceita até **200 caracteres** no
   servidor, embora o campo permita digitar mais.
3. Informe **latitude** e **longitude**. No Google Maps, elas podem ser obtidas
   com o botão direito sobre o local.
4. Informe o horário de abertura e de fechamento.
5. Marque os materiais aceitos: papel, metais, orgânicos e/ou biológicos.
6. Clique em **Criar**.

[captura: formulário "Criar um novo ponto" preenchido]

Seu ponto entra como **pendente** e só aparece no mapa depois que a ONG aprovar.
A tela não mostra uma confirmação de "pendente" nesta versão: ao concluir, você
volta ao mapa e o ponto ainda não estará lá.

**Defeito conhecido:** marcar **BIOLÓGICOS** grava **papel** no lugar. Até a
correção, evite usar essa opção e descreva o material no campo de descrição.

### Como relatar um problema em um ponto

1. Abra o cartão do ponto no mapa.
2. Clique em **Reportar Problema**.
3. Escolha uma categoria:
   - **O ponto não existe**;
   - **O ponto está cheio/em manutenção**;
   - **O ponto não funciona no horário correto**.
4. Escreva uma descrição do problema.
5. Clique em **Reportar Problema**.

[captura: tela "Reportar um problema" com categoria e descrição]

O relato é gravado, mas **não gera protocolo nem número de acompanhamento**, e a
tela não mostra confirmação. A ONG ainda não tem uma fila de relatos para
consultar. Guarde o endereço do ponto e, se precisar de retorno, procure o canal
da ONG.

### Como encerrar a sessão ou apagar minha conta

1. Clique no ícone de usuário no topo da tela.
2. Para sair, clique em **Terminar Sessão**.
3. Para apagar a conta, clique em **Deletar Conta** e confirme. A ação é
   irreversível e os dados não podem ser recuperados.

[captura: tela "Página do usuário" com as opções de sessão]

### Como instalar o aplicativo no celular

1. Abra o sistema no navegador do celular.
2. Use o menu do navegador e escolha **Instalar aplicativo** ou **Adicionar à
   tela inicial**.
3. O ícone do ReciclaRP aparece na tela inicial.

**A instalação não permite uso offline.** Não há cache de páginas nem
sincronização; sem conexão com a API, o sistema não funciona.

## Para ONGs

### Como receber o perfil de ONG

O perfil é concedido por um **código especial** fornecido pela equipe
responsável. Ele não é público e não deve ser compartilhado.

1. Entre com sua conta normalmente.
2. Abra a página do usuário pelo ícone no topo.
3. Em **Resgate do Código especial**, digite o código e clique em **Resgatar
   Código**.
4. Se o código estiver correto, aparece a mensagem "Código resgatado com
   sucesso!". O item **Portal da ONG** passa a aparecer no menu.

[captura: página do usuário com o campo de código especial]

> Em ambiente local, o código é definido por `RECICLA_ESCALATION_TOKEN`. Se essa
> variável não existir, a API gera um código e o imprime no log com o texto
> `Autogenerated: ...`. Em uma implantação real, esse comportamento precisa ser
> substituído por um processo seguro de credenciamento.

### Como aprovar um ponto sugerido por um cidadão

1. Abra o menu **☰** e escolha **Portal da ONG**.
2. A tabela lista todos os pontos, inclusive os pendentes, que aparecem com fundo
   amarelo.
3. Na coluna **Opções**, clique em **Aprovar** no ponto desejado.
4. Confirme o aviso de que o ponto ficará visível para todos.
5. A página recarrega e o ponto passa a aparecer no mapa público.

[captura: portal da ONG com um ponto pendente destacado e o link "Aprovar"]

**Não existe rejeição com justificativa.** Se a sugestão estiver errada, a única
ação disponível é **Deletar**. O autor não recebe aviso em nenhum dos casos.

### Como remover um ponto

1. No **Portal da ONG**, localize o ponto na tabela.
2. Clique em **Deletar** na coluna **Opções**.
3. Confirme o aviso de que os dados não poderão ser recuperados.
4. A remoção é imediata depois da confirmação.

Use com cuidado: a ação não tem desfazer e não fica registrada em histórico.

### Como criar um ponto diretamente como ONG

1. No portal, clique em **Criar novo ponto**.
2. Preencha os mesmos campos do formulário de cidadão.
3. Como sua conta é ONG, a tela avisa que o ponto será **aprovado
   automaticamente**.
4. Clique em **Criar**. Você volta ao portal.

### Como consultar os acessos de um ponto

1. No portal, clique em **Estatísticas** na linha de um ponto aprovado.
2. O painel mostra um gráfico de **acessos por hora**. O total por ponto fica na
   coluna **nº Acessado** da tabela do portal.
3. Feche com o **X** para voltar ao portal.

[captura: painel de estatísticas com o gráfico por hora]

**Limitações:** o gráfico usa os registros de abertura do ponto pelo botão
"Abrir no Maps". Ele não mede visitas presenciais, não separa por dia e omite os
rótulos de 18h e 22h no eixo, o que **desloca a leitura dos acessos a partir das
18h**. O painel também **não** agrega pontos por material nem por bairro.

### Como editar horário ou informações de um ponto

**Não é possível pela interface nesta versão.** A operação existe na API, mas
nenhuma tela a utiliza. Para corrigir um ponto, remova-o e crie outro, ou peça
apoio à equipe técnica.

## Perguntas frequentes

**Não recebi o código de acesso. O que faço?**
No ambiente local, o código não é enviado por e-mail: ele aparece no terminal da
API. Procure a linha `The login code for ... was ...`. Em um ambiente com envio
real, confira spam e o endereço digitado. Se nada chegar, aguarde 2 minutos antes
de pedir outro código.

**Por que não existe campo de senha?**
O ReciclaRP usa código de uso único. Cada acesso gera um código novo, válido por
15 minutos. Não há senha para criar, lembrar ou recuperar.

**Esqueci o código. Como recupero?**
Basta pedir um novo código. O anterior deixa de ser necessário; códigos expiram
em cerca de 15 minutos.

**Digitei o código errado. E agora?**
O código é de uso único e é descartado na primeira tentativa, mesmo errada. Peça
um novo código e aguarde o limite de 2 minutos antes de solicitar.

**Meu ponto não aparece no mapa. Por quê?**
Pontos sugeridos por cidadãos entram como pendentes e só aparecem após aprovação
da ONG. A tela não avisa quando a aprovação acontece.

**Posso editar um ponto que eu sugeri?**
Não pela interface. Não há tela de edição nem de acompanhamento da sugestão.

**O que significa "Aberto" no cartão do ponto?**
É um rótulo fixo nesta versão. Ele não verifica a hora atual. Use o horário
exibido para decidir.

**Por que o ponto não abre no Google Maps?**
O botão usa as coordenadas cadastradas. Se elas estiverem erradas ou incompletas,
o Maps pode abrir em outro lugar. Avise a ONG pelo relato de problema.

**Meu relato gerou protocolo?**
Não. O relato é gravado, mas não há número, status ou acompanhamento nesta
versão.

**A ONG pode rejeitar minha sugestão?**
Ainda não existe rejeição com justificativa. A ONG pode aprovar ou deletar. Em
ambos os casos, você não recebe aviso.

**O aplicativo funciona sem internet?**
Não. O PWA é instalável, mas não tem service worker nem cache offline.

**Por que apareceu "Muitas tentativas de login"?**
Há limite de requisições por rede. Espere 2 minutos e tente de novo. O mesmo vale
para criação de ponto.

**Meus dados aparecem para outras pessoas?**
O mapa mostra apenas dados do ponto. A contagem de acessos é agregada e a tela da
ONG não exibe quem abriu o ponto. O relato fica vinculado à sua conta no banco.
Evite escrever dados pessoais no texto do relato.

**O link "Configurações da conta" não funciona.**
Correto: ele aponta para uma página que não existe. Use o ícone de usuário no
topo para chegar à página do usuário. O link "Dicas de reciclagem" também ainda
não tem conteúdo.

## Problemas conhecidos

| Problema | Efeito | Contorno |
|---|---|---|
| Checkbox **BIOLÓGICOS** grava papel | Material errado no ponto | Descrever o material no texto e avisar a ONG |
| Link **Configurações da conta** quebrado | Página não encontrada | Usar o ícone de usuário no topo |
| **Dicas de reciclagem** sem página | Link não faz nada | Ainda não há conteúdo |
| Selo **Aberto** fixo | Pode indicar aberto quando está fechado | Conferir o horário exibido |
| Gráfico sem rótulos de 18h e 22h | Leitura imprecisa do eixo | Considerar a faixa vizinha |
| Relato sem confirmação/protocolo | Usuário não sabe se registrou | Registrar uma vez e contatar a ONG |
| Sessão cai ao reiniciar a API | É preciso entrar de novo | Pedir novo código |
| Rate limit de 1/2 min | Testes repetidos falham | Aguardar a janela ou reiniciar a API local |

## Onde pedir ajuda

- **Problemas com o sistema:** equipe do ReciclaRP (Adrian Souza Teixeira,
  Heitor Benedetti Lopes e Victor Breno Anastácio de Matos).
- **Problemas com um ponto específico:** use **Reportar Problema** no cartão do
  ponto e, se necessário, procure a ONG responsável.
- **Acesso de ONG:** solicite o código especial à equipe responsável. Nunca
  publique esse código em repositório, captura de tela ou mensagem aberta.
