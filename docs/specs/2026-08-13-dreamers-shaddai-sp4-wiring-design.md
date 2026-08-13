# Dreamers ↔ SHADDAI Integration — SP-4: Wire the Working Dashboard + Create Studio Media Hub

**Date:** 2026-08-13
**Status:** SP-4 foundation slice BUILT + verified — AI Chat runs on the real `/api/agentic/run` tool path with a live "tools used" receipt (proven headless, e2e, 0 CORS failures). Credits pill wired to `/api/economy/balance` but BLOCKED by a backend mount bug (see below). Remaining tabs + Create Studio = follow-on plans.

> **Backend blocker (needs decision):** `economy-routes.js` exports a factory (`module.exports = createRouter`) but `server-production.js:1425` mounts it un-called (`app.use('/api/economy', require('./economy-routes'))`). Express treats the factory as middleware → request hangs → "fetch failed". One-char fix: `require('./economy-routes')()`. This lives in the **SHADDAI repo** (not Dreamers) and requires a Render redeploy. Until fixed, `refreshSparks()` degrades gracefully (keeps prior/zero display).
**Sub-project:** SP-4 (first of the program; see Program Map below)
**Assisted by:** TURTLE (visual direction), SHADDAI RAG (mastery grounding)

---

## 1. Purpose & Core Insight

Dreamers and SHADDAI are the **same empire** — identical 7-agent council (SHADDAI, ZEROX, ORACLE, NEXUS, TURTLE, QUILL, PIKADON, ports 8000–8008) and, per the 2026-08-12 SHADDAI audit, a backend that already ships **every service the Dreamers dashboard needs**: `agent-engine.js` (~406 tools), `economy-service` (Sparks/Gold/Coin append-only ledger), Stripe billing, x402 + Solana-pay rails, `collectibles` NFT, `media-gen`/`turtle-video`, `referral-routes`/`reputation-routes`, ORACLE astrology, and RAG brain.

Therefore SP-4 is **wiring, not building.** The canonical Dreamers dashboard
`Dreamers\dashboard\dreamer-dashboard-v6.39.html` (461 KB, ~20 tabs, in-repo, newer May-29 copy) has the UI already built; its buttons are currently inert or mock. SP-4 points them at the live SHADDAI backend and unifies the economy. (A loose Apr-21 `dreamer_dashboard_v6.39_WORKING.html` in the home dir is an older divergent copy — superseded; ignore/archive it.)

**Two decisions locked by the user:**
- **Architecture:** Standalone Dreamers front-end (own brand/entry) on the **shared SHADDAI backend**.
- **Economy:** One shared off-chain **Sparks** ledger now (Dreamers "Impact/Dream Credits" = SHADDAI Sparks). Web3 (wallet, Solana Pay, NFT mints) live now. **`$DREAM` SPL token deferred** — designed as a future 1:1 on-chain wrapper launched after audit/legal (RULE 3). No token risk taken early.

**Bonus leverage:** The SHADDAI audit's #1 value leak is *"the free demo hits the LLM-only path; users never see the 406 tools fire."* SP-4 wires the Dreamers AI/agent tabs through the **tool path** (`runAgentLoop`) with a "tools used" receipt — so SP-4 also advances SHADDAI's own Phase-0 "prove the pitch" fix, on a fresh surface.

---

## 2. Scope

### In scope (SP-4)
1. Serve the v6.39 dashboard as the standalone **Dreamers** front-end.
2. Wire each live tab to its existing SHADDAI backend service (map in §4).
3. Unify the economy: dashboard credit displays and awards read/write the shared `economy-service` Sparks ledger via `x-user-id`.
4. Build the **Create Studio media hub** (artist tools): songs, binaural, art, writing, voiceover — mapped to existing engines (§5).
5. Route AI Chat / agent tabs through the **tool path** with a visible "tools used" receipt.
6. Cold-start wake-ping for the free-tier Render backend.

### Out of scope (later sub-projects)
- Learner/Creator/Guardian **roles** → SP-3
- **Education / micro-lesson** engine → SP-2
- **Habit/goal** tracking engine → SP-1
- **`$DREAM` on-chain token** → deferred (post-audit)
- Any change to SHADDAI's own `index.html` command deck

---

## 3. Architecture

```
┌─────────────────────────────┐        HTTPS + x-user-id        ┌──────────────────────────────┐
│  DREAMERS FRONT-END          │  ───────────────────────────▶  │  SHADDAI BACKEND (Render)     │
│  dreamer_dashboard_v6.39     │                                 │  Express :3000                │
│  (standalone, own brand)     │  ◀───────────────────────────  │                               │
│                              │        JSON results             │  agent-engine.js (tool path)  │
│  shd-api.js  ← thin client   │                                 │  economy-service (Sparks)     │
│  (fetch wrapper, session,    │                                 │  media-gen / turtle-video     │
│   wake-ping, tools-receipt)  │                                 │  collectibles / solana-pay    │
└──────────────┬──────────────┘                                 │  referral / reputation        │
               │                                                  │  ORACLE / brain / stripe      │
               │ local subprocess (dev) / HTTP bridge             └──────────────────────────────┘
               ▼
   FL-STUDIO-AI (Desktop\SHADDAI-MASTER\repos\FL-STUDIO-AI)
   flstudio_mcp.py · flstudio_ai.py · beatmaker.py  (DAW/beatmaker core)
```

**Key unit — `shd-api.js`** (new, ~150 lines): the single seam between the Dreamers UI and SHADDAI.
- One clear purpose: every backend call goes through it.
- Injects `x-user-id` (the same wrapper that fixed the cross-user leak, memory `SHADDAI_CROSS_USER_LEAK_FIX`), attaches the SHADDAI session, handles the Render cold-start wake-ping, and normalizes the "tools used" receipt.
- Consumers (each tab) never call `fetch` directly — they call `shd.chat()`, `shd.image()`, `shd.song()`, `shd.sparks()`, etc. This keeps the 460 KB HTML file from growing tangled and lets us swap backend origin (local ↔ Render) in one place.

**Backend origin:** Live Render (`shaddai-g81x.onrender.com`) is the default; a one-line origin switch allows `localhost:3000` for dev. (User is on free Render → wake-ping required.)

---

## 4. Tab → Service Mapping

| Dreamers tab | SHADDAI service | Endpoint (verify in code) | Notes |
|---|---|---|---|
| AI Chat / Turtle | `agent-engine` router | `/api/agent/run` (tool path) | stamp `tools used: […]` receipt |
| Writer | `agent-engine` QUILL | `/api/llm/chat` or `/api/agent/run` | writing help, lyrics, lore |
| Create Studio – Art / ASCII / Visualize | `media-gen` / `tools-turtle` | `/api/image/generate` | FLUX / pollinations fallback |
| Create Studio – Songs | Suno + Producer + FL-STUDIO-AI | new `/api/media/song` (thin) | see §5 |
| Create Studio – Binaural | client-side Web Audio | none | dual-oscillator, presets |
| NFT | `collectibles` + `solana-pay` | `/api/collectibles`, `/api/media/save` | mint from media library |
| Marketplace | Bazaar / marketplace-shop | `/api/market/*` | list/buy in Sparks |
| Community / Feed / Inbox | referral + reputation + social | `/api/referral/*`, `/api/reputation/*` | |
| Flywheel | `referral-routes` (3-tier) | `/api/referral/*` | live earnings |
| Credits / "Impact Credits" | **`economy-service` Sparks** | `/api/economy/*` (balance/credit/debit) | **the unification point** |
| Astrology | ORACLE + `tools-research horoscope` | `/api/agent/run` (ORACLE) | reuse existing |
| Practices / Workouts / Healing / Day Builder | Dreamers-native | award via `/api/economy/credit` | completion → Sparks |
| Voiceover / guided audio | Fish-Audio TTS | new `/api/media/tts` (thin) | narration |

---

## 5. Create Studio Media Hub (artist tools)

Purpose: one hub where a creator makes **sound, art, writing, and voice**, saves to a media library, and optionally mints. Every output writes to the shared media library and can award Sparks.

**Music — three tiers, one UI selector:**
1. **FL-STUDIO-AI** (`Desktop\SHADDAI-MASTER\repos\FL-STUDIO-AI`) — DAW/beatmaker + synthesis core (`flstudio_mcp.py`, `beatmaker.py`). The "produce a beat/pattern" path. Dev: local subprocess; prod: HTTP bridge or deferred to cloud tiers.
2. **Suno + Producer** (AceDataCloud, already integrated) — full songs from a prompt, lyrics, stems, MIDI, covers, vocal/instrumental swap. The "make a track" path. Both exposed as modes.
3. **Binaural / soundscapes** — client-side Web Audio dual-oscillator + presets (focus/sleep/meditation). Ties into Practices & Healing Buddy tabs. Zero backend cost.

**Other modules:** Art (TURTLE/FLUX), Writing (QUILL), Voiceover (Fish-Audio TTS). Each is an isolated panel calling one `shd-api.js` method; independently testable.

**Save/mint flow:** generate → `/api/media/save` (user's library) → optional `/api/collectibles` mint (Solana Pay). No new auth; rides the SHADDAI session.

### Visual direction (from TURTLE)
- **Concept:** dreamy-wellness meets the SHADDAI empire — soft, calm, but capable.
- **Layout:** horizontal **module selector** (icon + short label per module) across the top; below it a single **workspace** that swaps content per selected module (song / beat / binaural / art / write / voice). One thing on screen at a time — no window-in-window (consistent with the de-jank rule, memory `SHADDAI_DASHBOARD_DEJANK_PUNCHLIST`).
- **Palette:** soft purple accent `#cc97ff` (existing dashboard primary) on dark surface; white/near-white text; keep the SHADDAI emerald/gold reserved for cross-empire moments (e.g. "spend Sparks", mint).
- **Type:** clean modern sans (the dashboard already uses a label/body pairing — keep it; don't introduce a new family).
- **Signature delight:** module icons **glow soft-purple on hover**; extend it so the active module's icon keeps a gentle pulsing aura while its generator is running (doubles as a "working…" cue).

---

## 6. Economy Unification (the "$DREAM deferred" model, made real)

- Dreamers "Impact/Dream Credits" **become a display alias for SHADDAI Sparks**. Single source of truth = `economy-service` append-only, idempotent ledger.
- Wellness completions (Practices/Workouts/Healing/Day Builder), Create Studio outputs, and referrals **award Sparks** through the economy credit op.
- Spend Sparks in Marketplace / NFT mint / premium studio actions.
- **`$DREAM` path (deferred):** when volume justifies it, snapshot the Sparks ledger → mint `$DREAM` SPL 1:1 as an on-chain wrapper. No rework; the ledger is designed for this today. Multi-sig treasury + audit gate before any mint (RULE 3, RULE 7).

---

## 7. Error Handling & Reliability

- **Cold start:** `shd-api.js` fires a wake-ping to `/api/health` on load; shows a "waking the council…" state instead of a broken UI (free Render ~30–50 s first hit).
- **Tool-path failures:** surface the SHADDAI `/api/providers/failures` signal; degrade gracefully (e.g. image → pollinations fallback, song → shorter model).
- **Per-user isolation:** all calls carry `x-user-id`; no shared `guest` bucket (per the cross-user-leak fix).
- **Media cost guard:** Suno/Producer/FLUX calls check Sparks balance / tier before firing (reuse `pay-guard` / `credit-meter`).
- **Stale cache:** include the SW-kill + `?v=` cache-bust pattern (memory `SHADDAI_STALE_SW_CACHE`) so the wired dashboard doesn't serve an inert cached copy.

---

## 8. Testing

- **Unit:** `shd-api.js` methods (mock fetch) — session injection, wake-ping, receipt parsing.
- **Integration (live smoke):** one scripted pass hitting each wired endpoint against Render, asserting 200 + shape (mirrors the repo's existing HTTP-smoke style).
- **Manual/headless:** load the dashboard, click each Create Studio module, confirm real output + Sparks delta + "tools used" receipt on AI Chat (0-console-error headless render, per house style).

---

## 9. Program Map (context — later sub-projects, user's chosen order)

1. **SP-4 (this doc):** Wire dashboard + Create Studio media hub.
2. **SP-3:** Learner/Creator/Guardian/Admin roles on the shared SHADDAI profile.
3. **SP-2:** Education / micro-lesson engine (RAG-brain-powered).
4. **SP-1:** Habit/goal tracking engine (daily-engagement spine → XP/Sparks).
5. **Deferred:** `$DREAM` on-chain token (post audit/legal).

Each later sub-project gets its own spec → plan → build.

---

## 10. Open Items to Confirm During Implementation

- **Economy endpoints:** verify the real `economy-service` op/route names in code (`/api/economy/*` assumed). RAG KBs are mastery-grounded, not code-grounded, so these must be read from the source, not asked of an agent.
- **FL-STUDIO-AI prod bridge:** local-subprocess only (dev) vs. an HTTP shim for Render — decide at the music module. Can ship Suno/Producer/binaural first, add the FL core after.
- **Canonical Dreamers home:** RESOLVED — `Dreamers\dashboard\dreamer-dashboard-v6.39.html` (in-repo, May-29 copy) is canonical. Archive/delete the loose Apr-21 `dreamer_dashboard_v6.39_WORKING.html`.
- **Suno vs Producer default:** user chose "both, user picks" — confirm which is the default mode on first open.
