# E4a — Conferência do README do repositório

**Entrega:** E4 (README do Repositório)
**Data de referência:** 11/09/2026
**Reconstruído em:** 14/11/2026
**Arquivo avaliado:** [`README.md`](../../../../README.md)
**Repositório:** https://github.com/ReciclaRP/reciclarp

Este documento não substitui o README: ele audita o README existente contra
os critérios da E4 e registra o que falta para que um terceiro consiga subir o
projeto do zero.

## 1. Checklist da rubrica

| Critério da E4 | Situação | Observação |
|---|---|---|
| README.md na raiz do repositório | **Atende** | O arquivo existe e está versionado. |
| Nome completo e RA de cada integrante | **Atende** | Os três nomes e RAs estão na abertura. |
| Descrição curta do sistema | **Atende** | "Aplicação web/PWA headless que centraliza pontos de coleta..." |
| Stack de frontend, backend e banco | **Atende** | Vite/JS, Node+Express, SQLite; Leaflet/OSM e Chart.js. |
| Pré-requisitos com versões mínimas | **Atende** | Node.js 20+, npm, Python 3.6+, toolchain do SQLite por sistema operacional. |
| Passo a passo de instalação | **Atende** | `npm install` e `npm run dev` em `api/` e `webapp/`. |
| Variáveis de ambiente obrigatórias | **Parcial** | Cita `RECICLA_API_PORT` e `RECICLA_RESEND_SECRET`, mas não há `.env.example`; `RECICLA_WEBAPP_URL`, `RECICLA_ADMIN_EMAIL`, `RECICLA_ESCALATION_TOKEN`, `RECICLA_OTC_DURATION` e `RECICLA_MAX_POINTDESCRIPTION_LEN` não aparecem. |
| Comando de criação do banco/schema | **Atende com ressalva** | O banco é criado e semeado automaticamente no primeiro boot; o README explica que `db/schema.sql` é só referência. |
| Como rodar os testes | **Atende** | `cd api && npm test`; `cd webapp && npx vitest run`. |
| Estrutura do repositório | **Atende** | `/webapp`, `/api`, `/cli`, `/db`, `/docs`. |
| Convenções de branch e commit | **Atende** | `semana/<n>`, Conventional Commits em português, revisão do PO. |
| URL de deploy público | **Não atende** | O README diz "planejado para a Sprint 4 (E8, Semana 12)"; em 14/11/2026 não há URL. |
| Licença / uso acadêmico | **Atende** | AGPL-3.0 e texto de uso acadêmico. |
| Instruções de PWA | **Atende** | Explica que o manifesto permite instalar, mas não há service worker/offline. |

## 2. O que um terceiro consegue fazer hoje

1. Clonar o repositório e instalar as dependências dos dois projetos.
2. Subir a API em `http://localhost:3000` com `npm run dev`.
3. Subir o webapp em `http://localhost:5173` com `npm run dev`.
4. Fazer login por OTC em modo convidado (o código aparece no log da API).
5. Ver o mapa com os oito ecopontos semeados.
6. Rodar as duas suítes de teste.

O que **não** consegue: acessar uma instância pública, porque não há deploy.
Também precisa saber que a URL da API está fixa em
`webapp/src/logic/backend.js`; o README avisa, mas isso impede trocar a porta
sem editar código.

## 3. Lacunas objetivas para corrigir no README

| Lacuna | Correção sugerida |
|---|---|
| Sem `.env.example` | Criar `api/.env.example` com todas as variáveis e valores padrão. |
| Variáveis ausentes | Documentar `RECICLA_WEBAPP_URL`, `RECICLA_ADMIN_EMAIL`, `RECICLA_ESCALATION_TOKEN`, `RECICLA_OTC_DURATION` e `RECICLA_MAX_POINTDESCRIPTION_LEN`. |
| URL de deploy prometida e inexistente | Trocar por "não publicado" até existir URL real, ou publicar e atualizar. |
| `webapp/.env` versionado com variável legada | Remover o arquivo ou documentar que `VUE_APP_RECICLA_API_URL` não é usada. |
| Contagem de testes muda com frequência | Manter a data da aferição (o README já faz: 14/11/2026). |
| Não menciona o modo convidado como opção de avaliação | Destacar que, sem Resend, o código vai para o log — útil para o professor testar. |
| Não menciona as limitações conhecidas | Acrescentar link para `docs/wip/backfill/backlog-atualizado.md` ou para a E10a. |

## 4. Parecer

O README **atende à E4a** como documento de instalação e operação, com uma
lacuna bloqueante (deploy) e duas lacunas menores (`.env.example` e inventário
completo de variáveis). Ele é honesto quanto ao estado de desenvolvimento e
não descreve funcionalidades que não existem.

**Conformidade estimada:** 12 de 14 critérios atendidos, 1 parcial e 1 não
atendido (deploy).
