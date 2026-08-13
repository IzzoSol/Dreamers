// Dreamers/scripts/probe-backend.mjs
// Captures real response shapes so shd-api.js is built against fact, not assumption.
const ORIGIN = process.env.SHD_ORIGIN || 'https://shaddai-g81x.onrender.com';
const UID = 'probe-dreamers-0001';

async function hit(method, path, body) {
  try {
    const res = await fetch(ORIGIN + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-user-id': UID },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = text.slice(0, 400); }
    console.log(`\n=== ${method} ${path} -> ${res.status} ===`);
    console.log(JSON.stringify(json, null, 2).slice(0, 1500));
  } catch (e) {
    console.log(`\n=== ${method} ${path} -> ERROR ===`);
    console.log(String(e.message || e));
  }
}

console.log('ORIGIN =', ORIGIN);
await hit('GET', '/api/health');
await hit('GET', '/api/economy/balance');
await hit('POST', '/api/agentic/run', { agent: 'TURTLE', message: 'Say hello in one sentence.' });
