# RP Recicla

[Branch de Desenvolvimento](https://github.com/ReciclaRP/reciclarp/tree/semana/2)
[Painel de Rastreamento](https://github.com/orgs/ReciclaRP/projects/1/views/1)
[Protótipo do Figma](https://www.figma.com/design/VpJQCMN1ncZQrlraGeXbfb/Trabalho-do-Lucas?node-id=0-1&t=VMZweitYrp64vKfi-1)

**ATENÇÃO ATENÇÃO ATENÇÃO (　ﾟДﾟ)＜!! Leia este arquivo antes de trabalhar no projeto, ele contém informações importantes escritas por mãos humanas!**

---

Aplicação web/PWA headless que centraliza pontos de coleta de reciclagem de Ribeirão Preto: moradores consultam e cadastram pontos colaborativamente, e uma ONG modera as contribuições.

Este repositório contém dois projetos independentes que operam entre sí:

- **`webapp/`** — aplicação web/PWA headless, desenvolvida com Vite e tecnologias web padrão;
- **`api/`** — API REST, desenvolvida com Node.js + Express.js.

**Deploy:** Previsto para a Sprint 4 (E8, Semana 12, 30/10/2026)

**Equipe:**

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

## Stack

### `webapp`

Aplicação web escrita em JavaScript, utilizando o sistema de build Vite. Não utiliza nenhum framework para além disto; o OpenStreetMap é utilizado para visualização das localizações. 

### `api`

Uma API em Express.js, utilizando um banco de dados SQLite;

A API concentra autenticação, autorização, regras de negócio, validações e acesso ao banco de dados. Ela compõe o backend completo do ReciclaRP.

### Banco de dados

O banco de dados utilizado pelo projeto é o SQLite, um banco de dados maduro ideal para operações *in-memory* realizadas dentro de um mesmo host.

`db/schema.sql` contém o schema do banco. Ele é atualizado manualmente para questões de referência, e **não é o schema vigente**; este se encontra em `api/src/db/schema.js`

## Como rodar localmente

### Pré-requisitos

- Node.js 20+;
- npm;
- navegador moderno.

### API

Primeiro, defina a porta por qual a API irá interagir por meio da variável de ambiente `RECICLA_API_PORT`. (ex `export RP_API_PORT="5000"`). [at.]

Depois, defina a chave de API da plataforma Resend, utilizada para o envío de e-mails de autenticação, por meio da variável de ambiente `RECICLA_RESEND_SECRET`. **Sem esta chave, o programa irá operar no "modo convidado", sem controles reais de autenticação.**

Entre no projeto:

```bash
cd api
npm install
npm run dev
```

A API produzirá uma URL, ex. `http://localhost:3000/`. **Defina a variável de ambiente `RECICLA_API_URL` a partir desta** (ex. rode o comando `export RECICLA_API_URL="http://localhost:3000/"` conforme o caso anterior).

### Webapp

Com a variável de ambiente `RECICLA_API_URL` definida, execute em outro terminal:

```bash
cd webapp
npm install
npm run dev
```

Abra o URL resultante em seu navegador.

[at.]: Este projeto terá apoio à arquivos .env, mas as convenções para consumí-los ainda devem ser definidas.

## Estrutura do repositório

```
/webapp     - API REST (Express), acesso a dados, regras de negócio
/frontend   - PWA em Vite
/db         - schema.sql, somente para referência
/docs       - documentação acadêmica
```

## Testes

### `webapp`

Os testes da aplicação web verificam os fluxos de utilização e o comportamento da PWA.

### `api`

Os testes unitários e de integração da API verificam regras de negócio, rotas, validações e persistência.

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
