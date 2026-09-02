# DEV-ENVIRONMENT (client)

Running this repo locally. (Server-side ops, the test rig and e2e harness belong to
the sibling private repo `pigeonpost-server`; cross-repo procedure is `../CLAUDE.md`.)

## Run locally
```bash
npm install
npm run web        # Expo web (dev) → opens in browser
npm run android    # Android (needs SDK/emulator; later)
npm run ios        # iOS (needs macOS; later)
```
Web is the target for now; Expo means Android/iOS come later from the same code.

## Environment
`.env` is gitignored. Shape only (see `.env.example`):
- `EXPO_PUBLIC_API_URL` — base URL of the pigeonpost API (defaults to the local
  dev server when unset).

## Gate (run before every commit)
```bash
bash scripts/check.sh   # typecheck + unit tests + reuse gate + copy-paste gate
```
There is **no CI** (decision C15): before merging, the gate is re-run locally from
a clean checkout of the branch and reported in the handoff as a local run.

Gate details:
- **Reuse gate** (`scripts/check_ui_reuse.sh`) — named-primitive ceilings that
  only ever go DOWN (ported from Mogul Music): raw `TextInput` in a screen is
  ceiling 0 (build shared inputs in `src/ui/components/`), and private
  `_Widget`/`_Screen` definitions in screens are banned — reusable pieces get
  promoted, with `reuse-exempt: <why>` as the conscious one-off escape hatch.
- **Copy-paste gate** (`scripts/check_clones.sh`) — jscpd counts cross-file
  clones in `src/` against a falling ceiling (currently 3); intra-file
  repetition is local structure, not a leak, and is ignored.

## Git identity on this machine
Default `jon@privacymogul.com`; anything under `~/Documents/Lituus/` overrides to
`jon@lituus.studio` (a git `includeIf`). Personal repos here use the personal address.
