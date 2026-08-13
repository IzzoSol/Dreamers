# Coordination: Dreamers terminal ↔ SHADDAI terminal (2026-08-13)

Two terminals, two repos, ONE shared backend. This note keeps them from colliding.

| | Dreamers terminal (this) | SHADDAI terminal (other) |
|---|---|---|
| Repo | `C:\Users\Brittany\Dreamers` | `Desktop\SHADDAI MASTER FINAL BUILD` |
| Branch | `feat/dreamers-shaddai-sp4` | `feat/hire-council-media-markets-rag-20260813` |
| Owns | Dreamers dashboard (standalone front-end) | SHADDAI backend + landing (`home.html`) + dashboard (`index.html`) + `turtle-music-bot.html` |

They connect at ONE point: the SHADDAI backend on Render. The Dreamers dashboard *calls* it.

## 3 action items for the SHADDAI terminal

### 1. Keep + commit the economy fix (already in your working tree)
I edited `backend/server-production.js:1425`:
```js
app.use('/api/economy', require('./economy-routes')());   // was: require('./economy-routes')  — factory must be CALLED
```
Why: `economy-routes` exports a factory; mounted un-called, Express treated it as middleware → `/api/economy/balance` hung ("fetch failed"). Verified: now returns 200 `{sparks_balance}`. The Dreamers Sparks balance depends on this being on Render. **Commit just that one file** (don't sweep the data churn):
```
git add backend/server-production.js
git commit -m "fix: call economy-routes factory so /api/economy mounts"
git push
```

### 2. Music is now meshed — no duplication
- Your `turtle-music-bot.html` = THE studio engine (Web Audio, works). Good.
- The Dreamers dashboard now **embeds a copy** of it + adds a 7-agent "Council" panel (QUILL lyrics, ORACLE mood, TURTLE vibe + cover art).
- HF MusicGen confirmed dead on both sides — the Web Audio studio is the real path. I dropped my MusicGen button.

### 3. Put the same Music on the SHADDAI landing + dashboard
Drop this minimal embed wherever you want Music to appear in `home.html` and `index.html`:
```html
<section id="shaddai-music" style="padding:24px">
  <h2>SHADDAI Music</h2>
  <iframe src="/turtle-music-bot.html" title="SHADDAI Music Studio"
          style="width:100%;height:560px;border:1px solid rgba(255,255,255,.1);border-radius:8px" loading="lazy"></iframe>
</section>
```
Optional — to add the same 7-agent Council panel, lift the `councilAsk()` / `councilCover()` JS + the Council HTML from the Dreamers dashboard `#music-ws-council` block; it calls `/api/agentic/run` which you already have.

## Direction (owner, 2026-08-13)
Owner leaning toward **Dreamers as its own brand** (own landing + music + merch) on the shared SHADDAI backend. So the Dreamers dashboard is intentionally self-contained (its own copy of the studio). Merch = a future follow-on.
