# RP Recicla

PWA que centraliza pontos de coleta de reciclagem de Ribeirão Preto: moradores consultam e cadastram pontos colaborativamente, e uma ONG modera as contribuições.

**Deploy:** Previsto para a Sprint 4 (E8, Semana 12, 30/10/2026)

**Equipe:** 

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

## Stack

- Frontend: PWA React 18 e Vite 5 (com `vite-plugin-pwa`)
- Backend: Node.js 20 + Express 4 (API REST)
- Banco de dados: PostgreSQL 15

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 10+

### Passo a passo

1. Clone o repositório: `git clone https://github.com/ReciclaRP/reciclarp.git`
2. Instale as dependências: `cd reciclarp && npm install` (raiz instala frontend e backend via workspaces)
3. Configure as variáveis de ambiente (copie `backend/.env.example` para `backend/.env`):

   | Variável | Descrição |
   |---|---|
   | `DATABASE_URL` | string de conexão do PostgreSQL, ex.: `postgres://user:pass@localhost:5432/rprecicla` |
   | `JWT_SECRET` | segredo para assinatura dos tokens de autenticação |
   | `PORT` | porta do backend (padrão 3333) |

   E `frontend/.env.example` para `frontend/.env`:

   | Variável | Descrição |
   |---|---|
   | `VITE_API_URL` | URL base da API (ex.: `http://localhost:3333`) |

4. Crie o banco e rode o schema: `psql -U postgres -c "CREATE DATABASE rprecicla"` seguido de `psql -U postgres -d rprecicla -f db/schema.sql` (o script já inclui um seed mínimo)
5. Suba o backend: `cd backend && npm run dev`
6. Suba o frontend: `cd frontend && npm run dev`
7. Acesse em `http://localhost:5173`

## Estrutura do repositório

```
/backend    - API REST (Express), acesso a dados, regras de negócio
/frontend   - PWA em React (manifest, service worker)
/db         - schema.sql (E3c), fiel ao DER da E3b
/docs       - documento de visão (E1), backlog e termo de aceite (E2), UML e DER (E3), plano de testes (E4)
```

## Convenções da equipe

- Branches: `feature/nome-da-feature`;
- Commits: Conventional Commits, com destacamento de *breaking changes* ignorado (`feat:`, `fix:`, `docs:`, `test:`, sem `feat!`);
- Toda PR exige revisão do PO (Lopes; HLRangel) antes da integração no `main`;
- PO pode realizar merges de forma unilateral; e pode também fazer commits de forma direta no caso de bugs de alta severidade/exposição de segredos.

## Testes

Backend: `cd backend && npm test` (Jest)

## Licença / Uso acadêmico

Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software - ADS, Fatec Ribeirão Preto, 2026.

O ReciclaRP foi desenvolvido em 2026, por: Heitor Lopes (HLRangel), Adrian Teixeira (adriansouza05), e Victor Breno.

Na medida do permitido pela legislação vigente, os autores dedicam ao domínio público, por meio da dedicação Creative Commons Zero 1.0 Universal (CC0), todos os direitos autorais e direitos conexos relativos a esta obra, renunciando não apenas seus direitos sobre a obra na legislação brasileira, mas também em legislações do exterior e na lei internacional, especialmente os direitos relacionados aos tratados WIPO e a Convenção de Berna.

Você deve ter recebido uma cópia da dedicação Creative Commons Zero 1.0 Universal (CC0) juntamente com este software. Caso contrário, consulte <http://creativecommons.org>.

**ESTE SOFTWARE É FORNECIDO EXPRESSAMENTE "NO ESTADO EM QUE SE ENCONTRA". OS DESENVOLVEDORES NÃO OFERECEM QUALQUER TIPO DE GARANTIA, SEJA EXPRESSA, IMPLÍCITA, DE FATO OU DECORRENTE DE DISPOSIÇÃO LEGAL, INCLUINDO, SEM LIMITAÇÃO, AS GARANTIAS IMPLÍCITAS DE COMERCIABILIDADE, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA, NÃO VIOLAÇÃO E PRECISÃO DOS DADOS. OS DESENVOLVEDORES NÃO DECLARAM NEM GARANTEM QUE A OPERAÇÃO DO SOFTWARE SERÁ ININTERRUPTA OU LIVRE DE ERROS, OU QUE QUAISQUER DEFEITOS SERÃO CORRIGIDOS. OS DESENVOLVEDORES NÃO GARANTEM NEM FAZ QUAISQUER DECLARAÇÕES RELATIVAS AO USO DO SOFTWARE OU AOS RESULTADOS DELE DECORRENTES, INCLUINDO, MAS NÃO SE LIMITANDO A, A CORREÇÃO, PRECISÃO, CONFIABILIDADE OU UTILIDADE DO SOFTWARE.**
