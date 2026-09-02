# CLAUDE.md (client repo — pointer)

This repo is part of the **pigeonpost project**. The working procedure — session
lifecycle, worktrees, the two-repo model, doc rules, commit and verification rules —
lives in the parent folder: **[`../CLAUDE.md`](../CLAUDE.md). Go read it, and read this
repo's own [`docs/README.md`](docs/README.md) too.**

Repo-specific notes:
- This repo is the **client** and is publish-bound: treat everything here as public
  from day one. Server implementation details, creds, and server docs never come in.
- The wire contract is [`docs/reference/API.md`](docs/reference/API.md) — the server
  repo implements it, e2e (which lives in the server repo) runs against it.
