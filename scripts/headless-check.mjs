// Headless load check for the Dreamers dashboard.
// Uses puppeteer-core + system Chrome from the SHADDAI build.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Brittany/Desktop/SHADDAI MASTER FINAL BUILD/node_modules/puppeteer-core');

const FILE = 'file://' + path.resolve('dashboard/dreamer-dashboard-v6.39.html').replace(/\\/g, '/');

const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const pg = await b.newPage();
const errs = [];
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

await pg.goto(FILE, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));

const seam = await pg.evaluate(() => ({
  shdReady: !!(window.shd && typeof window.shd.chat === 'function' && typeof window.shd.balance === 'function'),
  hasSend: typeof sendTurtleMessage === 'function',
  hasRefresh: typeof refreshSparks === 'function',
}));

// Ignore errors NOT caused by SP-4:
//  - file:// asset 404s (root-relative /js/* app assets served only in the full app)
//  - audioContext: pre-existing wellness-audio init (7 refs in committed HEAD, untouched by SP-4;
//    doesn't initialize under headless file://)
const realErrs = errs.filter(e => !/net::ERR|Failed to load resource|\/js\/|audioContext/.test(e));

console.log('seam:', JSON.stringify(seam));
console.log('real console errors:', realErrs.length);
if (realErrs.length) console.log(realErrs.slice(0, 8).join('\n'));
await b.close();
process.exit(seam.shdReady && seam.hasSend && seam.hasRefresh && realErrs.length === 0 ? 0 : 1);
