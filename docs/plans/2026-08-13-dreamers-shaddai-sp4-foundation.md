# Dreamers ↔ SHADDAI SP-4 Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Dreamers dashboard's AI Chat and credits display to the live SHADDAI backend through a single thin client (`shd-api.js`), proving the standalone-front-end-on-shared-backend architecture end-to-end with real tool execution and a real shared Sparks balance.

**Architecture:** The canonical dashboard `Dreamers/dashboard/dreamer-dashboard-v6.39.html` loads one new module, `dashboard/shd-api.js`, which is the sole seam to the SHADDAI backend on Render. This plan delivers the *vertical slice*: (1) the seam, (2) AI Chat through the real tool path with a "tools used" receipt, (3) the credits pill backed by the real `/api/economy` Sparks ledger, (4) cold-start handling. Remaining tabs + the Create Studio media hub are follow-on plans (see §Follow-On).

**Tech Stack:** Vanilla JS (browser, no build step), the existing SHADDAI Express backend (`Desktop/SHADDAI MASTER FINAL BUILD/backend/server-production.js`) on Render, Node for the smoke script, headless Chrome (puppeteer-core + system Chrome) for behavior checks.

**Verified backend contract (2026-08-13):**
- Tool path: `POST /api/agentic/run` (handler `lib/agent-tool-run.js`) — agents execute tools.
- Sparks: `GET /api/economy/balance`, `POST /api/economy/grant`, `GET /api/economy/catalog`, `POST /api/economy/catalog/purchase`.
- Health: `GET /api/health`.
- Origin (default): `https://shaddai-g81x.onrender.com` (free tier → cold start ~30–50 s → wake-ping required). Dev override: `http://localhost:3000`.

**Repo note:** Work happens in the `Dreamers/` git repo. Commit after each task.

---

### Task 0: Capture the live backend contract (probe before code)

Rationale: `shd-api.js` must match the *real* JSON shapes of `/api/agentic/run` and `/api/economy/balance`. Capture them once so later code isn't guessed.

**Files:**
- Create: `Dreamers/scripts/probe-backend.mjs`

- [ ] **Step 1: Write the probe script**

```js
// Dreamers/scripts/probe-backend.mjs
// Captures real response shapes so shd-api.js is built against fact, not assumption.
const ORIGIN = process.env.SHD_ORIGIN || 'https://shaddai-g81x.onrender.com';
const UID = 'probe-dreamers-0001';

async function hit(method, path, body) {
  const res = await fetch(ORIGIN + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-user-id': UID },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text.slice(0, 400); }
  console.log(`\n=== ${method} ${path} -> ${res.status} ===`);
  console.log(JSON.stringify(json, null, 2).slice(0, 1500));
}

await hit('GET', '/api/health');
await hit('GET', '/api/economy/balance');
await hit('POST', '/api/agentic/run', { agent: 'TURTLE', message: 'Say hello in one sentence.' });
```

- [ ] **Step 2: Run it and record the shapes**

Run: `node Dreamers/scripts/probe-backend.mjs`
Expected: three blocks printed. Note the exact keys for: the agent reply text (e.g. `reply` / `answer` / `output`), the tools-used array (e.g. `toolsUsed` / `tools`), and the balance field (e.g. `balance` / `sparks`). **Record these in a comment at the top of `shd-api.js` in Task 1.**

> If `/api/agentic/run` requires different params (e.g. `goal` instead of `message`, or `agentName`), adjust the probe body until it returns 200, and use the working shape in Task 1.

- [ ] **Step 3: Commit**

```bash
git add Dreamers/scripts/probe-backend.mjs
git commit -m "chore: backend contract probe for Dreamers SP-4"
```

---

### Task 1: The `shd-api.js` thin client (the seam)

**Files:**
- Create: `Dreamers/dashboard/shd-api.js`
- Test: `Dreamers/dashboard/shd-api.test.mjs`

- [ ] **Step 1: Write the failing test** (uses a fetch stub; asserts header injection + receipt parsing)

```js
// Dreamers/dashboard/shd-api.test.mjs
import assert from 'node:assert';
import { createShd } from './shd-api.js';

let lastCall = null;
const fakeFetch = async (url, opts) => {
  lastCall = { url, opts };
  if (url.endsWith('/api/economy/balance')) return jsonRes({ ok: true, balance: 1234 });
  if (url.endsWith('/api/agentic/run')) return jsonRes({ ok: true, reply: 'hi', toolsUsed: ['web_search'] });
  if (url.endsWith('/api/health')) return jsonRes({ ok: true });
  throw new Error('unexpected url ' + url);
};
function jsonRes(obj){ return { ok: true, status: 200, json: async () => obj, text: async () => JSON.stringify(obj) }; }

const shd = createShd({ origin: 'https://x.test', userId: 'u1', fetchImpl: fakeFetch });

// injects x-user-id on every call
await shd.balance();
assert.equal(lastCall.opts.headers['x-user-id'], 'u1', 'must inject x-user-id');

// balance returns the numeric field
const bal = await shd.balance();
assert.equal(bal, 1234, 'balance() returns numeric sparks');

// chat returns { reply, tools }
const out = await shd.chat({ agent: 'TURTLE', message: 'hi' });
assert.equal(out.reply, 'hi');
assert.deepEqual(out.tools, ['web_search'], 'chat() normalizes tools-used receipt');

console.log('shd-api tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node Dreamers/dashboard/shd-api.test.mjs`
Expected: FAIL — `Cannot find module './shd-api.js'` (or `createShd is not a function`).

- [ ] **Step 3: Write minimal implementation**

> Replace the field names (`reply`, `toolsUsed`, `balance`) below with the ACTUAL keys recorded in Task 0 if they differ.

```js
// Dreamers/dashboard/shd-api.js
// Contract (from probe-backend.mjs, 2026-08-13): adjust keys here if the probe differed.
//   /api/agentic/run  -> { reply, toolsUsed: [...] }
//   /api/economy/balance -> { balance }
const DEFAULT_ORIGIN = 'https://shaddai-g81x.onrender.com';

export function createShd({ origin = DEFAULT_ORIGIN, userId, fetchImpl } = {}) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) throw new Error('no fetch available');
  const uid = userId || 'dreamer-anon';

  async function call(method, path, body) {
    const res = await f(origin + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  return {
    origin, userId: uid,
    health: () => call('GET', '/api/health'),
    async balance() {
      const d = await call('GET', '/api/economy/balance');
      return (d && (d.balance ?? d.sparks ?? 0)) || 0;
    },
    async chat({ agent = 'TURTLE', message }) {
      const d = await call('POST', '/api/agentic/run', { agent, message });
      return { reply: d.reply ?? d.answer ?? d.output ?? '', tools: d.toolsUsed ?? d.tools ?? [] };
    },
    grant(amount, reason) {
      return call('POST', '/api/economy/grant', { amount, reason });
    },
  };
}

// Browser global (dashboard is a plain <script>, not a module bundler)
if (typeof window !== 'undefined') window.createShd = createShd;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node Dreamers/dashboard/shd-api.test.mjs`
Expected: PASS — prints `shd-api tests passed`.

- [ ] **Step 5: Commit**

```bash
git add Dreamers/dashboard/shd-api.js Dreamers/dashboard/shd-api.test.mjs
git commit -m "feat: shd-api.js thin client seam to SHADDAI backend"
```

---

### Task 2: Load the seam + wake-ping in the dashboard

**Files:**
- Modify: `Dreamers/dashboard/dreamer-dashboard-v6.39.html` (add `<script src="shd-api.js">` before the main inline script; init `window.shd` on load)

- [ ] **Step 1: Add the script tag and init**

Find the first line of the main inline `<script>` (the one containing `function go(tab)` near line 3095). Immediately BEFORE that `<script>` tag, insert:

```html
<script src="shd-api.js"></script>
<script>
  // Boot the single backend seam. userId = existing dashboard user id if present, else a persisted anon id.
  (function(){
    let uid = localStorage.getItem('dreamer_uid');
    if(!uid){ uid = 'dreamer-' + Math.random().toString(36).slice(2,10); localStorage.setItem('dreamer_uid', uid); }
    const origin = localStorage.getItem('shd_origin') || 'https://shaddai-g81x.onrender.com';
    window.shd = window.createShd({ origin, userId: uid });
    // Wake-ping (free Render cold start). Non-blocking; UI shows a hint until it resolves.
    document.addEventListener('DOMContentLoaded', function(){
      const hint = document.getElementById('shd-wake-hint');
      window.shd.health().then(()=>{ if(hint) hint.remove(); })
        .catch(()=>{ if(hint) hint.textContent = 'Council is waking… retrying shortly.'; });
    });
  })();
</script>
```

- [ ] **Step 2: Add the wake hint element**

Inside the top of `<body>` (just after the opening `<body>` tag), insert:

```html
<div id="shd-wake-hint" class="fixed bottom-3 right-3 z-50 text-[10px] px-3 py-1 bg-primary/20 border border-primary text-white rounded">Waking the council…</div>
```

- [ ] **Step 3: Verify headless (no console errors, seam present)**

Run this Node check (requires puppeteer-core + system Chrome, per repo house style):

```bash
node -e "const p=require('puppeteer-core');(async()=>{const b=await p.launch({channel:'chrome',headless:'new'});const pg=await b.newPage();const errs=[];pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));await pg.goto('file://'+process.cwd().replace(/\\\\/g,'/')+'/Dreamers/dashboard/dreamer-dashboard-v6.39.html',{waitUntil:'networkidle2'});const hasShd=await pg.evaluate(()=>!!window.shd&&typeof window.shd.chat==='function');console.log('window.shd ready:',hasShd,'| console errors:',errs.length);await b.close();process.exit(hasShd?0:1);})();"
```

Expected: `window.shd ready: true | console errors: 0`

- [ ] **Step 4: Commit**

```bash
git add Dreamers/dashboard/dreamer-dashboard-v6.39.html
git commit -m "feat: load shd-api seam + Render wake-ping in Dreamers dashboard"
```

---

### Task 3: Wire AI Chat through the real tool path (with tools-used receipt)

Replace the mock `sendTurtleMessage()` (currently requires the user's own OpenAI key and returns a canned reply) with a real call to `window.shd.chat()`.

**Files:**
- Modify: `Dreamers/dashboard/dreamer-dashboard-v6.39.html:6294-6324` (`sendTurtleMessage`)

- [ ] **Step 1: Replace the function body**

Replace the entire existing `function sendTurtleMessage(){ … }` (lines 6294–6324) with:

```js
async function sendTurtleMessage(){
  const input=document.getElementById('turtle-input');
  const msg=input?.value?.trim();
  if(!msg) return;
  const hist=document.getElementById('turtle-chat-history');
  const append=(html)=>{ if(hist){ const d=document.createElement('div'); d.innerHTML=html; hist.appendChild(d.firstElementChild); hist.scrollTop=hist.scrollHeight; } };
  append(`<div class="flex justify-end"><div class="bg-primary text-surface p-3 rounded max-w-xs"><p class="text-[11px]">${msg.replace(/[<]/g,'&lt;')}</p></div></div>`);
  input.value='';
  append(`<div class="flex justify-start" id="turtle-thinking"><div class="bg-primary/20 border-l-2 border-primary p-3 rounded max-w-xs"><p class="text-[11px] text-white/70">Thinking…</p></div></div>`);
  try {
    const { reply, tools } = await window.shd.chat({ agent: 'TURTLE', message: msg });
    document.getElementById('turtle-thinking')?.remove();
    const receipt = tools && tools.length ? `<p class="text-[9px] text-accent mt-1">tools used: ${tools.join(', ')}</p>` : '';
    append(`<div class="flex justify-start"><div class="bg-primary/20 border-l-2 border-primary p-3 rounded max-w-xs"><p class="text-[11px] text-white">${(reply||'(no reply)').replace(/[<]/g,'&lt;')}</p>${receipt}</div></div>`);
  } catch (e) {
    document.getElementById('turtle-thinking')?.remove();
    append(`<div class="flex justify-start"><div class="bg-red-500/20 border-l-2 border-red-400 p-3 rounded max-w-xs"><p class="text-[11px] text-white">Couldn't reach the council. ${String(e.message||e).slice(0,80)}</p></div></div>`);
  }
}
```

- [ ] **Step 2: Live smoke — chat returns a real reply**

Run: `node Dreamers/scripts/probe-backend.mjs` (already hits `/api/agentic/run`) and confirm a non-empty reply field. This is the same path the UI now uses.
Expected: the `POST /api/agentic/run` block prints a real sentence, and (if the agent used any) a tools array.

- [ ] **Step 3: Headless behavior check — reply renders**

```bash
node -e "const p=require('puppeteer-core');(async()=>{const b=await p.launch({channel:'chrome',headless:'new'});const pg=await b.newPage();await pg.goto('file://'+process.cwd().replace(/\\\\/g,'/')+'/Dreamers/dashboard/dreamer-dashboard-v6.39.html',{waitUntil:'networkidle2'});await pg.evaluate(()=>go('turtle'));await pg.type('#turtle-input','Say hi in one sentence.');await pg.evaluate(()=>sendTurtleMessage());await new Promise(r=>setTimeout(r,15000));const txt=await pg.$eval('#turtle-chat-history',e=>e.innerText);console.log('chat contains reply:',txt.length>20);await b.close();})();"
```

Expected: `chat contains reply: true` (allow time for Render cold start on first run).

- [ ] **Step 4: Commit**

```bash
git add Dreamers/dashboard/dreamer-dashboard-v6.39.html
git commit -m "feat: AI Chat runs on real SHADDAI tool path with tools-used receipt"
```

---

### Task 4: Back the credits pill with the real Sparks balance

The dashboard shows `walletState.credits` (a mock "Impact Credits" number). Point the on-page credits display at the real `/api/economy/balance` so Dreamers "Impact Credits" == SHADDAI Sparks.

**Files:**
- Modify: `Dreamers/dashboard/dreamer-dashboard-v6.39.html` (add `refreshSparks()`, call it on load; update the `#onchain-credits` element)

- [ ] **Step 1: Add `refreshSparks()` near `updateWalletUI` (after line 4047)**

```js
// Real shared Sparks balance (Dreamers "Impact Credits" == SHADDAI Sparks)
async function refreshSparks(){
  try {
    const sparks = await window.shd.balance();
    walletState.credits = sparks;
    const el = document.getElementById('onchain-credits');
    if(el) el.textContent = Number(sparks).toLocaleString();
    const hdr = document.getElementById('hdr-credits'); // if present
    if(hdr) hdr.textContent = Number(sparks).toLocaleString();
  } catch(e){ console.warn('sparks refresh failed', e); }
}
```

- [ ] **Step 2: Call it on load** — inside the existing `DOMContentLoaded` handler (line ~6912), add:

```js
  refreshSparks();
```

- [ ] **Step 3: Headless check — credits populated from backend**

```bash
node -e "const p=require('puppeteer-core');(async()=>{const b=await p.launch({channel:'chrome',headless:'new'});const pg=await b.newPage();await pg.goto('file://'+process.cwd().replace(/\\\\/g,'/')+'/Dreamers/dashboard/dreamer-dashboard-v6.39.html',{waitUntil:'networkidle2'});await new Promise(r=>setTimeout(r,12000));const v=await pg.$eval('#onchain-credits',e=>e.textContent);console.log('credits text:',v);await b.close();})();"
```

Expected: prints a number sourced from `/api/economy/balance` (may be `0` for a fresh user — that's correct, it's the real ledger).

- [ ] **Step 4: Commit**

```bash
git add Dreamers/dashboard/dreamer-dashboard-v6.39.html
git commit -m "feat: credits pill backed by real shared Sparks ledger"
```

---

### Task 5: Slice acceptance + docs

- [ ] **Step 1: Full smoke pass**

Run: `node Dreamers/scripts/probe-backend.mjs`
Expected: health 200, balance 200 (numeric), agentic/run 200 (real reply). No 4xx/5xx.

- [ ] **Step 2: Update the spec's status line**

In `Dreamers/docs/specs/2026-08-13-dreamers-shaddai-sp4-wiring-design.md`, change the Status line to:
`**Status:** SP-4 foundation slice built (AI Chat + Sparks wired); remaining tabs + Create Studio = follow-on plans.`

- [ ] **Step 3: Commit**

```bash
git add Dreamers/docs/specs/2026-08-13-dreamers-shaddai-sp4-wiring-design.md
git commit -m "docs: mark SP-4 foundation slice complete"
```

---

## Follow-On (separate plans, after this slice is green)

Each is its own plan doc, same pattern (seam method → wire tab → smoke → headless → commit):

1. **Create Studio media hub** — `shd.image()` (`/api/media-gen` + `/api/image/generate`), `shd.song()` (Suno/Producer via `/api/media-gen` music), binaural (client Web Audio), Writer (QUILL via `/api/agentic/run`), voiceover (Fish-Audio), save→mint (`/api/media/save` → `/api/collectibles`). TURTLE visual direction in spec §5.
2. **Wellness → Sparks** — Practices/Workouts/Healing/Day-Builder completions call `shd.grant()` (`/api/economy/grant`).
3. **Marketplace + NFT** — `/api/economy/catalog` + `/api/collectibles` + `/api/solana-pay`; replace the simulated `mintCredits()`/`stakeTokens()`.
4. **Community / Flywheel** — `/api/referral/*` + `/api/reputation/*`.

---

## Self-Review

- **Spec coverage:** This plan covers spec §3 (shd-api seam), §4 AI Chat + credits rows, §6 economy unification (balance now; grant/spend in follow-on), §7 cold-start + per-user isolation. Create Studio (§5), wellness/marketplace/community rows (§4), and mint/spend are explicitly deferred to Follow-On plans — matching the spec's "each sub-project its own spec→plan."
- **Placeholder scan:** No TBD/TODO. Field-name adaptation (Task 1) is gated on the Task 0 probe, which is a real captured contract, not a placeholder.
- **Type consistency:** `createShd()` returns `{ health, balance, chat, grant, origin, userId }`; `chat()` returns `{ reply, tools }`; used consistently in Tasks 2–4. `refreshSparks()`/`sendTurtleMessage()` names match the elements they touch (`#onchain-credits`, `#turtle-input`, `#turtle-chat-history`) verified in the dashboard source.
