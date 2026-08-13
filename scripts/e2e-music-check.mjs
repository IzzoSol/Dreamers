// E2E: SHADDAI Music tab — tab switch, binaural (no throw), lyrics via QUILL.
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

// Tab exists + activates
const tabActive = await pg.evaluate(() => { go('shaddai-music'); return document.getElementById('tab-shaddai-music').classList.contains('active'); });

// Binaural start/stop must not throw
const binOk = await pg.evaluate(() => { try { setBinaural(200, 10); startBinaural(); stopBinaural(); return true; } catch (e) { return 'THREW: ' + e.message; } });

// Lyrics via QUILL (live)
await pg.evaluate(() => { showMusicModule('lyrics'); document.getElementById('lyrics-prompt').value = 'Write one short uplifting line about dreams.'; generateLyrics(); });
await new Promise(r => setTimeout(r, 18000));
const lyrics = await pg.$eval('#lyrics-out', e => e.textContent);

console.log('tab activates:', tabActive);
console.log('binaural ok:', binOk);
console.log('lyrics out:', JSON.stringify((lyrics || '').slice(0, 160)));
console.log('page errors:', errs.length ? errs.slice(0, 5).join(' | ') : 'none');
await b.close();
process.exit(tabActive && binOk === true && lyrics && lyrics.length > 10 && lyrics !== 'Writing…' ? 0 : 1);
