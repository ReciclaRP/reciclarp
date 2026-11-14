# RP Recicla

[Branch de Desenvolvimento](https://github.com/ReciclaRP/reciclarp/tree/semana/7)
[Painel de Rastreamento](https://github.com/orgs/ReciclaRP/projects/1/views/1)
[Protótipo do Figma](https://www.figma.com/design/VpJQCMN1ncZQrlraGeXbfb/Trabalho-do-Lucas?node-id=0-1&t=VMZweitYrp64vKfi-1)

**ATENÇÃO ATENÇÃO ATENÇÃO (　ﾟДﾟ)＜!! Leia este arquivo antes de trabalhar no projeto, ele contém informações importantes escritas por mãos humanas!**

---

Aplicação web/PWA headless que centraliza pontos de coleta de reciclagem de Ribeirão Preto: moradores consultam e cadastram pontos colaborativamente, e uma ONG modera as contribuições.

Este repositório contém dois projetos independentes que operam entre si:

- **`webapp/`** — aplicação web/PWA headless, desenvolvida com Vite e tecnologias web padrão;
- **`api/`** — API REST, desenvolvida com Node.js + Express.js.

**Deploy:** planejado para a Sprint 4 (E8, Semana 12); acompanhe o estado atual no painel de rastreamento.

**Equipe:**

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

## Stack

### `webapp`

Aplicação web escrita em JavaScript, utilizando o sistema de build Vite. Não utiliza nenhum framework de UI para além disto; o Leaflet e o OpenStreetMap são utilizados para visualização das localizações, e o Chart.js para o gráfico de acessos do painel da ONG.

### `api`

Uma API em Express.js, utilizando um banco de dados SQLite;

A API concentra autenticação, autorização, regras de negócio, validações e acesso ao banco de dados. Ela compõe o backend completo do ReciclaRP.

A autenticação é feita por **código de uso único (OTC) de seis dígitos** enviado por e-mail: `POST /auth/login` solicita o código, `POST /auth/token` o troca por um token de sessão e `POST /auth/logout` encerra a sessão. Os tokens ficam **em memória**, então reiniciar a API invalida todos os logins.

### Banco de dados

O banco de dados utilizado pelo projeto é o SQLite, um banco relacional embutido em arquivo único, adequado a uma aplicação executada em um mesmo host.

`db/schema.sql` contém o schema do banco. Ele é atualizado manualmente para questões de referência, e **não é o schema vigente**; este se encontra em `api/src/db/schema.js`

## Como rodar localmente

### Pré-requisitos

- Node.js 20+;
- npm;
- Python 3.6.0 (ou superior);
- navegador moderno.

Para apoio ao SQLite, é necessário que você tenha uma *toolchain* de desenvolvimento instalada no seu sistema operacional.

#### No Windows

- Visual Studio 2017 ou superior

#### Em sistemas Unix não-MacOS

- gcc
- make

#### No MacOS

- Xcode Command Line Tools (que instalam o clang e o make)

### API

Primeiro, defina a porta por qual a API irá interagir por meio da variável de ambiente `RECICLA_API_PORT` (ex. `export RECICLA_API_PORT="5000"`; o padrão é `3000`).

Depois, defina a chave de API da plataforma Resend, utilizada para o envio de e-mails de autenticação, por meio da variável de ambiente `RECICLA_RESEND_SECRET`. **Sem esta chave, a API opera no "modo convidado": os códigos de seis dígitos são impressos no log da API em vez de enviados por e-mail. A autenticação continua obrigatória.** Nunca use o modo convidado em um host compartilhado.

Entre no projeto:

```bash
cd api
npm install
npm run dev
```

A API lê variáveis de ambiente de um arquivo `api/.env` (relativo à raiz do repositório), além das variáveis já exportadas no shell. A URL padrão é `http://localhost:3000`.

**Limites de requisição (por IP):** `/auth/login`, `/point/create` e `/point/update` aceitam **1 requisição a cada 2 minutos**; `/auth/token` aceita **1 por minuto**; as demais rotas aceitam 100 a cada 15 minutos. Ao testar manualmente, aguarde a janela ou reinicie a API.

### Webapp

Em outro terminal:

```bash
cd webapp
npm install
npm run dev
```

Abra o URL resultante em seu navegador.

> **Atenção:** a URL da API está fixa em `http://localhost:3000` no arquivo `webapp/src/logic/backend.js` (constante `API_URL`). Não existe variável de ambiente para isso; se você mudar `RECICLA_API_PORT`, será necessário alterar essa constante no código-fonte.

O webapp inclui um manifesto PWA (`webapp/manifest.webmanifest`), então pode ser instalado na tela inicial de um navegador móvel pelo próprio menu do navegador ("Instalar aplicativo" ou "Adicionar à tela inicial"). A instalação **não** habilita uso offline: não há service worker, e o aplicativo continua dependendo da API.

## Estrutura do repositório

```
/webapp     - PWA em Vite (páginas, estilos, imagens e manifesto de instalação)
/api        - API REST (Express), acesso a dados, regras de negócio
/cli        - Pequeno programa utilizado para interagir com a API. Pode ser ignorado.
/db         - schema.sql, somente para referência
/docs       - documentação acadêmica e notas de apoio (`docs/agent-docs`, `docs/wip`)
```

## Testes

Cada projeto tem sua própria suíte. Rode os comandos a partir da raiz do repositório:

```bash
# API: node:test, sobe o servidor real contra um SQLite temporário
cd api && npm test

# Webapp: Vitest (o `npm test` abre em modo watch; `npx vitest run` executa uma vez)
cd webapp && npx vitest run
```

### `webapp`

Os testes da aplicação web verificam os fluxos de utilização e o comportamento da PWA.

### `api`

Os testes unitários e de integração da API verificam regras de negócio, rotas, validações e persistência. A suíte inclui testes de regressão de segurança (`api/tests/security.regression.test.js`): os testes ativos devem permanecer verdes, e os marcados com `skip` descrevem correções ainda pendentes (ver `docs/agent-docs/security.md`).

Estado em 14/11/2026: API com **91 testes (79 passam, 12 pulados, 0 falham)**; webapp com **131 testes (129 passam, 2 `todo`, 0 falham)**.

Nenhum PR que introduza alterações cobertas pelos testes deverá ser integrado em `main` se a suíte correspondente falhar após o PO decretar que o status de MVP foi atingido.

## Convenções da equipe

- **Branches:** `semana/<número da semana de desenvolvimento>` [at. 1];
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), com destacamento de *breaking changes* ignorado (`feat:`, `fix:`, `docs:`, `test:`, sem `feat!`);
- **Toda PR exige revisão do PO** (Lopes; HLRangel) antes da integração no `main`;
- **PO pode realizar merges de forma unilateral**; e pode também fazer commits de forma direta no caso de bugs de alta severidade/exposição de segredos.
- **Decreto de MVP**: O PO decreta que o software atingiu o estado de MVP quando o programa atingir um nível suficiente de maturidade funcional. Após este decreto, o bloqueio de merge por falha nos testes entra em vigor.

[at. 1]: Na primeira semana de desenvolvimento, utilizamos uma outra convenção para a nomeação de branches, que agora se encontra **deprecada**.

## Documentação acadêmica

- `docs/Entrega1LES.pdf` — Documento de Visão;
- `docs/Backlog.pdf` — Backlog priorizado;
- `docs/TermoAceite.pdf` — Termo de Aceite;
- `docs/uml.md` — UML;
- `docs/der.md` — DER;
- `docs/plano-de-testes.md` — Plano de Testes;
- `docs/prototipo.md` — roteiro do protótipo;
- `docs/rastreabilidade.md` — matriz de rastreabilidade.

### Documentação para contribuidores

- `AGENTS.md` — contrato de trabalho para agentes de IA e índice da documentação técnica;
- `docs/agent-docs/` — guias técnicos de arquitetura, API, webapp, testes e segurança (em inglês);
- `docs/wip/doc-drift.md` — divergências conhecidas entre os documentos acadêmicos e o código atual, com propostas de correção.

**O SOFTWARE ESTÁ EM DESENVOLVIMENTO ATIVO, E PODE DIVERGIR DA ESPECIFICAÇÃO!**

A divisão em `webapp` e `api` é uma decisão arquitetural dentro do mesmo repositório e não altera o escopo funcional do backlog.

## Licença / Uso acadêmico

Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software - ADS, Fatec Ribeirão Preto, 2026.

O ReciclaRP foi desenvolvido em 2026, por: Heitor Lopes (HLRangel), Adrian Teixeira (adriansouza05), e Victor Breno. Ele está sobre a licença **GNU Affero General Public License**, V3.

Você deve ter recebido uma cópia da licença juntamente com este software. Caso contrário, consulte https://www.gnu.org/licenses/agpl-3.0.html.

**ESTE SOFTWARE É FORNECIDO EXPRESSAMENTE "NO ESTADO EM QUE SE ENCONTRA". OS DESENVOLVEDORES NÃO OFERECEM QUALQUER TIPO DE GARANTIA, SEJA EXPRESSA, IMPLÍCITA, DE FATO OU DECORRENTE DE DISPOSIÇÃO LEGAL, INCLUINDO, SEM LIMITAÇÃO, AS GARANTIAS IMPLÍCITAS DE COMERCIABILIDADE, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA, NÃO VIOLAÇÃO E PRECISÃO DOS DADOS.**

## Atribuição

Esta aplicação distribui fontes. Suas licenças respectivas podem ser encontradas em `webapp/fonts/<nome da fonte>/<nome da licença>`.

As licenças de dependências de terceiros incluídas nesta aplicação podem ser encontradas em `api/third-party-licenses.txt` e `webapp/third-party-licenses.txt`.
