// Fetches Printful store products -> dashboard/assets/shop/products.json (no secrets stored).
// Run: PF_TOKEN=xxx PF_STORE=8639376 node scripts/fetch-printful.mjs
import fs from 'node:fs';
const TOK = process.env.PF_TOKEN;
const SID = process.env.PF_STORE || '8639376';
if (!TOK) { console.error('set PF_TOKEN env'); process.exit(1); }
const H = { Authorization: 'Bearer ' + TOK, 'X-PF-Store-Id': SID };

const list = await (await fetch('https://api.printful.com/store/products?limit=100', { headers: H })).json();
const rows = list.result || [];
const out = [];
for (const p of rows) {
  try {
    const d = await (await fetch('https://api.printful.com/store/products/' + p.id, { headers: H })).json();
    const sp = d.result.sync_product; const vars = d.result.sync_variants || [];
    const prices = vars.filter(v => !v.is_ignored).map(v => parseFloat(v.retail_price)).filter(x => x > 0);
    const price = prices.length ? Math.min(...prices) : null;
    let img = sp.thumbnail_url;
    if (!img && vars[0] && vars[0].files) { const pv = vars[0].files.find(f => f.type === 'preview'); if (pv) img = pv.preview_url; }
    out.push({ name: sp.name, price, img, id: p.id });
  } catch (e) {}
}
fs.mkdirSync('dashboard/assets/shop', { recursive: true });
fs.writeFileSync('dashboard/assets/shop/products.json', JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'products');
