// Dreamers/dashboard/shd-api.js
// The single seam between the Dreamers dashboard and the SHADDAI backend.
// Every backend call goes through here: injects x-user-id, handles cold-start,
// and normalizes the "tools used" receipt.
//
// Loaded in the browser as a CLASSIC <script> (no ES modules) so window.createShd
// is defined synchronously before the inline boot code runs. Also works under Node
// (module.exports) for the unit test.
//
// Contract (verified via scripts/probe-backend.mjs, 2026-08-13):
//   POST /api/agentic/run          -> { response, toolsUsed: [...] }
//   GET  /api/economy/balance?userId=X -> { sparks_balance }   (route reads userId from QUERY, not x-user-id header)
//   GET  /api/health               -> liveness
(function (root) {
  var DEFAULT_ORIGIN = 'https://shaddai-g81x.onrender.com';

  function createShd(opts) {
    opts = opts || {};
    var origin = opts.origin || DEFAULT_ORIGIN;
    var f = opts.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
    if (!f) throw new Error('no fetch available');
    var uid = opts.userId || 'dreamer-anon';

    async function call(method, path, body) {
      var res = await f(origin + path, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: body ? JSON.stringify(body) : undefined,
      });
      return res.json();
    }

    return {
      origin: origin,
      userId: uid,
      health: function () { return call('GET', '/api/health'); },
      async balance() {
        var d = await call('GET', '/api/economy/balance?userId=' + encodeURIComponent(uid));
        return (d && (d.sparks_balance != null ? d.sparks_balance : (d.balance != null ? d.balance : (d.sparks != null ? d.sparks : 0)))) || 0;
      },
      async chat(args) {
        args = args || {};
        var d = await call('POST', '/api/agentic/run', { agent: args.agent || 'TURTLE', message: args.message });
        return {
          reply: d.response != null ? d.response : (d.reply != null ? d.reply : (d.answer != null ? d.answer : (d.output || ''))),
          tools: d.toolsUsed || d.tools || [],
        };
      },
      grant: function (amount, reason) { return call('POST', '/api/economy/grant', { amount: amount, reason: reason }); },
      // AI song via HF MusicGen. Returns { ok, audio(dataURI)|null, error?, needsKey?, suggestUpgrade? }.
      async song(prompt) {
        var d = await call('POST', '/api/media-gen/music', { prompt: prompt });
        return {
          ok: !!(d && d.ok), audio: (d && d.audio) || null,
          needsKey: !!(d && d.needsKey), suggestUpgrade: !!(d && d.suggestUpgrade),
          error: (d && d.error) || null,
        };
      },
    };
  }

  if (typeof window !== 'undefined') window.createShd = createShd;
  if (typeof module !== 'undefined' && module.exports) module.exports = { createShd: createShd };
})(this);
