// Headless render check for the cinematic landing (index.html).
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pptr = require('C:/Users/Brittany/Desktop/SHADDAI MASTER FINAL BUILD/node_modules/puppeteer-core');
const FILE = 'file://' + path.resolve('dashboard/index.html').replace(/\\/g, '/');

const b = await pptr.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(e.message));
pg.on('console', m => m.type() === 'error' && errs.push(m.text()));

await pg.goto(FILE, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2500));

const info = await pg.evaluate(() => ({
  three: !!window.THREE,
  canvas: (() => { const c = document.getElementById('dream'); return c ? c.width + 'x' + c.height : 'none'; })(),
  title: document.querySelector('.title i')?.textContent,
  cards: document.querySelectorAll('.card').length,
  reveals: document.querySelectorAll('.reveal-up').length,
}));

console.log('three loaded:', info.three);
console.log('canvas:', info.canvas);
console.log('title:', info.title, '| cards:', info.cards, '| reveal blocks:', info.reveals);
console.log('errors:', errs.length ? errs.slice(0, 5).join(' | ') : 'none');
await b.close();
process.exit(info.three && info.cards > 0 && errs.length === 0 ? 0 : 1);
