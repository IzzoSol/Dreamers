// E2E: SHADDAI Music tab — tab switch, studio iframe, binaural (no throw), Council QUILL live.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pptr = require('C:/Users/Brittany/Desktop/SHADDAI MASTER FINAL BUILD/node_modules/puppeteer-core');
const FILE = 'file://' + path.resolve('dashboard/dreamer-dashboard-v6.39.html').replace(/\\/g, '/');

const b = await pptr.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(e.message));

await pg.goto(FILE, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1200));

const tabActive = await pg.evaluate(() => { go('shaddai-music'); return document.getElementById('tab-shaddai-music').classList.contains('active'); });
const studioEmbedded = await pg.evaluate(() => !!document.querySelector('#music-ws-studio iframe[src="turtle-music-bot.html"]'));
const binOk = await pg.evaluate(() => { try { showMusicModule('binaural'); setBinaural(200, 10); startBinaural(); stopBinaural(); return true; } catch (e) { return 'THREW: ' + e.message; } });

// Council QUILL (live)
await pg.evaluate(() => { showMusicModule('council'); document.getElementById('council-theme').value = 'chasing dreams at 3am'; councilAsk('QUILL'); });
await new Promise(r => setTimeout(r, 18000));
const council = await pg.$eval('#council-out', e => e.textContent);

console.log('tab activates:', tabActive);
console.log('studio embedded:', studioEmbedded);
console.log('binaural ok:', binOk);
console.log('council(QUILL) out:', JSON.stringify((council || '').slice(0, 160)));
console.log('page errors:', errs.length ? errs.slice(0, 5).join(' | ') : 'none');
const ok = tabActive && studioEmbedded && binOk === true && council && council.length > 15 && !council.endsWith('thinking…');
await b.close();
process.exit(ok ? 0 : 1);
