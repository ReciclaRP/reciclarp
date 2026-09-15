# RP Recicla

Aplicação web/PWA headless que centraliza pontos de coleta de reciclagem de Ribeirão Preto: moradores consultam e cadastram pontos colaborativamente, e uma ONG modera as contribuições.

O projeto utiliza um único repositório (monorepo), contendo dois projetos independentes:

- **`webapp/`** — aplicação web/PWA headless, desenvolvida com Vite e tecnologias web padrão, sem React;
- **`api/`** — API REST, desenvolvida com Node.js + Express.js.

**Deploy:** Previsto para a Sprint 4 (E8, Semana 12, 30/10/2026)

**Equipe:**
- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

## Stack

### `webapp`

- PWA headless;
- Vite;
- HTML, CSS e JavaScript;
- APIs padrão do navegador;
- OpenStreetMap para visualização das localizações.

O Vite é utilizado como ferramenta de desenvolvimento e build da aplicação web.

### `api`

- Node.js;
- Express.js;
- API REST;
- PostgreSQL 15+.

A API concentra autenticação, autorização, regras de negócio, validações e acesso ao banco de dados.

### Banco de dados

O modelo PostgreSQL está em `db/schema.sql`.

As tabelas atualmente especificadas são:

- `usuario`
- `material_aceito`
- `ponto_coleta`
- `ponto_material`
- `horario_funcionamento`
- `requisicao_cadastro`
- `relato_problema`

## Como rodar localmente

### Pré-requisitos

- Node.js 20+;
- npm;
- PostgreSQL 15+;
- navegador moderno.

### API

Entre no projeto:

```bash
cd api
npm install
npm run dev
```

Os scripts e variáveis de ambiente definitivos serão mantidos em `api/package.json` e `api/.env.example`.

### Webapp

Em outro terminal:

```bash
cd webapp
npm install
npm run dev
```

O `webapp` consumirá a API REST conforme a URL configurada no ambiente de desenvolvimento.

As portas definitivas serão estabelecidas durante a implementação.

## Estrutura do repositório

```
/backend    - API REST (Express), acesso a dados, regras de negócio
/frontend   - PWA em React (manifest, service worker)
/db         - schema.sql (E3c), fiel ao DER da E3b
/docs       - documento de visão (E1), backlog e termo de aceite (E2), UML e DER (E3), plano de testes (E4)
```

## Banco de dados

`db/schema.sql` contém o schema do banco e um seed mínimo.

A aplicação `webapp` não acessa o PostgreSQL diretamente. Todo acesso persistente é realizado pela `api`.

## Testes

### `webapp`

Os testes da aplicação web verificam os fluxos de utilização e o comportamento da PWA.

### `api`

Os testes unitários e de integração da API verificam regras de negócio, rotas, validações e persistência.

Nenhum PR que introduza alterações cobertas pelos testes deverá ser integrado em `main` se a suíte correspondente falhar.

## Convenções da equipe

- Branches: `feature/nome-da-feature`;
- Commits: Conventional Commits, com destacamento de *breaking changes* ignorado (`feat:`, `fix:`, `docs:`, `test:`, sem `feat!`);
- Toda PR exige revisão do PO (Lopes; HLRangel) antes da integração no `main`;
- PO pode realizar merges de forma unilateral; e pode também fazer commits de forma direta no caso de bugs de alta severidade/exposição de segredos.

## Documentação acadêmica

- `docs/Entrega1LES.pdf` — Documento de Visão;
- `docs/Backlog.pdf` — Backlog priorizado;
- `docs/TermoAceite.pdf` — Termo de Aceite;
- `docs/uml.md` — UML;
- `docs/der.md` — DER;
- `docs/plano-de-testes.md` — Plano de Testes;
- `docs/prototipo.md` — roteiro do protótipo;
- `docs/rastreabilidade.md` — matriz de rastreabilidade.

A divisão em `webapp` e `api` é uma decisão arquitetural dentro do mesmo repositório e não altera o escopo funcional do backlog.

## Licença / Uso acadêmico

Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software - ADS, Fatec Ribeirão Preto, 2026.

O ReciclaRP foi desenvolvido em 2026, por: Heitor Lopes (HLRangel), Adrian Teixeira (adriansouza05), e Victor Breno.

Na medida do permitido pela legislação vigente, os autores dedicam ao domínio público, por meio da dedicação Creative Commons Zero 1.0 Universal (CC0), todos os direitos autorais e direitos conexos relativos a esta obra, renunciando não apenas seus direitos sobre a obra na legislação brasileira, mas também em legislações do exterior e na lei internacional, especialmente os direitos relacionados aos tratados WIPO e a Convenção de Berna.

Você deve ter recebido uma cópia da dedicação Creative Commons Zero 1.0 Universal (CC0) juntamente com este software. Caso contrário, consulte https://creativecommons.org.

**ESTE SOFTWARE É FORNECIDO EXPRESSAMENTE "NO ESTADO EM QUE SE ENCONTRA". OS DESENVOLVEDORES NÃO OFERECEM QUALQUER TIPO DE GARANTIA, SEJA EXPRESSA, IMPLÍCITA, DE FATO OU DECORRENTE DE DISPOSIÇÃO LEGAL, INCLUINDO, SEM LIMITAÇÃO, AS GARANTIAS IMPLÍCITAS DE COMERCIABILIDADE, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA, NÃO VIOLAÇÃO E PRECISÃO DOS DADOS.**
