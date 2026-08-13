// Dreamers/dashboard/shd-api.test.cjs
const assert = require('node:assert');
const { createShd } = require('./shd-api.js');

let lastCall = null;
const fakeFetch = async (url, opts) => {
  lastCall = { url, opts };
  if (url.includes('/api/economy/balance')) return jsonRes({ ok: true, sparks_balance: 1234 });
  if (url.endsWith('/api/agentic/run')) return jsonRes({ ok: true, response: 'hi', toolsUsed: ['web_search'] });
  if (url.endsWith('/api/health')) return jsonRes({ ok: true });
  throw new Error('unexpected url ' + url);
};
function jsonRes(obj){ return { ok: true, status: 200, json: async () => obj, text: async () => JSON.stringify(obj) }; }

(async () => {
  const shd = createShd({ origin: 'https://x.test', userId: 'u1', fetchImpl: fakeFetch });

  // injects x-user-id on every call
  await shd.balance();
  assert.equal(lastCall.opts.headers['x-user-id'], 'u1', 'must inject x-user-id');

  // balance() passes userId as a query param (route requires it)
  assert.ok(lastCall.url.includes('userId=u1'), 'balance() must pass userId query');

  // balance returns the numeric sparks_balance field
  const bal = await shd.balance();
  assert.equal(bal, 1234, 'balance() returns numeric sparks');

  // chat returns { reply, tools } from { response, toolsUsed }
  const out = await shd.chat({ agent: 'TURTLE', message: 'hi' });
  assert.equal(out.reply, 'hi');
  assert.deepEqual(out.tools, ['web_search'], 'chat() normalizes tools-used receipt');

  console.log('shd-api tests passed');
})();
