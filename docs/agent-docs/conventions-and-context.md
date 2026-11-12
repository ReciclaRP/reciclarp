# Conventions and project context

## Team workflow rules

- **Branches:** `semana/<n>` where *n* is the current development week
  (currently `semana/7`). Week 1 used a deprecated scheme — don't reuse it.
- **Commits:** Conventional Commits, written in **Portuguese**, without
  breaking-change markers (`feat:`, `fix:`, `docs:`, `test:`, `misc:` — no
  `feat!`). Examples from history: `feat: deleção de pontos`,
  `fix: erro no acesso de variável`.
- **PRs:** every PR into `main` requires PO review (Heitor Lopes / HLRangel).
  Only the PO may merge unilaterally, or commit directly to `main` for
  high-severity bugs / leaked secrets.
- **MVP decree:** once the PO declares MVP reached, PRs that fail the test
  suites are blocked from merging. Until then, tests are advisory but still
  expected.
- Task tracking happens on the GitHub Projects board; development happened on
  weekly branches per the sprints of the academic backlog.

## Academic context

This is a course project for *Laboratório de Engenharia de Software* (ADS,
Fatec Ribeirão Preto, 2026), team: Adrian Teixeira, Heitor Lopes, Victor
Breno. Documentation and deliverables follow the course's required format
(equity/RA headers, "Trilha B", etc.). The backlog is the functional source of
truth — the running software may diverge from `docs/` mid-sprint.

## Academic documents in `docs/`

| File | Contents |
| --- | --- |
| `Entrega1LES.pdf` | Vision document. |
| `Backlog.pdf` | Prioritized product backlog (user stories). |
| `TermoAceite.pdf` | Acceptance term (project scope with stakeholders). |
| `uml.md` | UML diagrams of the system. |
| `der.md` | Entity-relationship diagram. |
| `plano-de-testes.md` | Test plan / strategy. |
| `prototipo.md` | Figma prototype walkthrough; maps screens to user stories. **Also records real decisions**, e.g. auth was changed to one-time-code instead of email+password. |
| `rastreabilidade.md` | Traceability matrix: user story → use case → entity → table → test. Useful for finding where a requirement is implemented/tested. |

## Scope reminders

- Core scope: map of collection points (citizen view), collaborative point
  registration, ONG moderation (approve/edit/remove points), citizen reports,
  OTC email authentication. Nothing about payments, routing, or gamification
  is in scope.
- `cli/` exists only as a manual API helper — don't invest effort there unless
  asked.
- Licenses matter: the project is AGPL-3.0 and distributes font licenses
  (`webapp/fonts/<name>/`) plus `third-party-licenses.txt` files generated via
  `generate-license-file` in both projects. When adding a dependency, expect
  the license file to be regenerated.
