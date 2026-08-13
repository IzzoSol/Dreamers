# Dreamers

A Web3 creative + wellness ecosystem by Izzo (IzzoSol) on Solana — a standalone **Dreamers dashboard** running on the shared **SHADDAI** backend, the **Dreamers Climb** game, a **$DREAM** token economy (deferred; off-chain Sparks for now), NFTs, marketplace, and the **SHADDAI Music** studio.

## 🌙 Dreamers Dashboard (main app)

`dashboard/dreamer-dashboard-v6.39.html` — the canonical dashboard. Wellness + creativity + community, wired to the live SHADDAI backend.

- **AI Chat** — runs the real SHADDAI agent tool path (`/api/agentic/run`), with a "tools used" receipt.
- **SHADDAI Music** — an artist studio: **Studio** (embedded Web Audio music bot), **Binaural** soundscapes, and a **Council** panel where the 7 agents help make the track (QUILL lyrics · ORACLE mood · TURTLE vibe + cover art).
- **Impact Credits = Sparks** — one shared off-chain ledger with SHADDAI (`/api/economy`). `$DREAM` token is a deferred 1:1 on-chain wrapper (post audit).
- Wellness tabs: Day Builder, Practices, Workouts, Healing Buddy, Herbs, Shopping, Calendar, Astrology.

Front-end seam: `dashboard/shd-api.js` — the single client to the SHADDAI backend (injects `x-user-id`, wake-ping, tools receipt). Backend origin defaults to the SHADDAI Render service.

**Entry point for hosting:** `dashboard/index.html` redirects to the dashboard (Render Static Site → Publish Directory = `dashboard`).

## 🎮 Dreamers Climb

Pixel-art tower-climbing game. `game/`:

| Build | Notes |
|-------|-------|
| `dreamers-climb-v31.0.html` | Latest fixed build |
| `dreamers-climb-v28.88.html` | Ultimate Edition (Web3) |
| `dreamers-climb-v25.html` | Dream-Arcade Edition (revamp base; uses `game/sprites/`) |
| `dreamers-climb-v24.0.html` / `v22` / `v15` | Archived builds |

Art in `game/sprites/`. Also `game/dream-world.html`.

## 🎛️ FL Studio MCP

`tools/fl-studio-mcp/` — the FL Studio AI/MCP music-production toolkit (beatmaker, synthesis engines, knowledge docs). See `tools/fl-studio-mcp/FLSTUDIO_MCP_README.md` and `00 INDEX.md`. Python-based; not part of the static site — a companion tool/service for music production.

## 💎 Ecosystem

`ecosystem/` — $DREAM token economy, NFT system, DAO, marketplace, artist showcase docs.
`docs/` — integration specs/plans (`docs/specs`, `docs/plans`) + `docs/dreamers-ecosystem/` design docs. Coordination with the SHADDAI terminal: `docs/COORDINATION-with-shaddai-terminal.md`.

## 🚀 Deploy

- **Dashboard:** Render **Static Site** → repo `IzzoSol/Dreamers`, branch `main`, Build Command empty, Publish Directory `dashboard`.
- **Backend:** the shared SHADDAI Web Service on Render (separate repo). The dashboard calls it; CORS allows `*.onrender.com`.

## 🔗 Links

- Repo: https://github.com/IzzoSol/Dreamers

---

*Built with ❤️ • Solana • Dreamers® / PlaySys® — All Rights Reserved 2007–2026*
