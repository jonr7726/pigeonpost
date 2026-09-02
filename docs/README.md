# Docs index (client)

The map of every doc in this repo. **This is the single "start here" for the
client repo** — no other doc claims to be the entry point. Every `.md` under
`docs/` is listed here.

Docs fall into three lifecycles: **Living** (kept current forever), **Reference**
(stable how-to), and **Plans** (a design for one slice — frozen once it ships).

## Start here (in order)
1. [`../CLAUDE.md`](../CLAUDE.md) — the project's procedure (cross-repo: session lifecycle, worktrees, doc rules).
2. [`reference/DEV-ENVIRONMENT.md`](reference/DEV-ENVIRONMENT.md) — run the client, the client-side gate.
3. [`DESIGN.md`](DESIGN.md) — how it works today (the living design).
4. [`plans/CRYPTO-SPEC.md`](plans/CRYPTO-SPEC.md) — the crypto blueprint (Phase 0).
5. [`ROADMAP.md`](ROADMAP.md) — what's next.

## Living — kept current
| Doc | Purpose |
|-----|---------|
| [`DESIGN.md`](DESIGN.md) | The **what** — architecture, the crypto model, the trust model. Read before structural changes. |
| [`DECISIONS.md`](DECISIONS.md) | The **why** — ADR log, one `Cnn` per locked choice. Supersede, don't edit. **Cross-cutting and client-side decisions live here** (this is the primary log; server-only entries`Snn` live in the server repo's log). |
| [`ROADMAP.md`](ROADMAP.md) | Future work only: the feature streams + Unscheduled + Open questions. Items leave when shipped. |
| [`reference/API.md`](reference/API.md) | **The wire contract.** The client defines it; the server repo implements it. Never copy server implementation docs here. |

## Reference — stable how-to (in `reference/`)
| Doc | Purpose |
|-----|---------|
| [`reference/DEV-ENVIRONMENT.md`](reference/DEV-ENVIRONMENT.md) | Running/building the client locally, the client-side gate. |
| [`reference/TESTING.md`](reference/TESTING.md) | Test tiers; where each tier lives (crypto/unit here, e2e in the server repo). |

## Plans — one slice each, frozen when shipped
Each carries a `Status:` line. Active plans are linked from `ROADMAP.md` by `R-NNN`.
| Plan | Status |
|------|--------|
| [`plans/CRYPTO-SPEC.md`](plans/CRYPTO-SPEC.md) | **Active** (foundation for R-001–R-008) |

## Other
- Root [`README.md`](../README.md) — project overview for a human landing on the repo.
- **Sibling private repo** `pigeonpost-server/` — server design, server ops, the e2e
  harness and the per-worktree test rig live there. Its docs are **private**: do not
  copy them here, and do not reproduce server implementation detail (paths, env,
  storage layout) in these client docs.
