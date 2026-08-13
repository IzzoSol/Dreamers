// End-to-end: does AI Chat reach the live backend from the browser?
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pptr = require('C:/Users/Brittany/Desktop/SHADDAI MASTER FINAL BUILD/node_modules/puppeteer-core');

const FILE = 'file://' + path.resolve('dashboard/dreamer-dashboard-v6.39.html').replace(/\\/g, '/');

const b = await pptr.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const pg = await b.newPage();
const netErr = [];
pg.on('requestfailed', r => { if (r.url().includes('/api/')) netErr.push(r.url() + ' :: ' + r.failure().errorText); });

await pg.goto(FILE, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));
await pg.evaluate(() => go('turtle'));
await pg.evaluate(() => { document.getElementById('turtle-input').value = 'Say hi in exactly one short sentence.'; sendTurtleMessage(); });
await new Promise(r => setTimeout(r, 20000));

const txt = await pg.$eval('#turtle-chat-history', e => e.innerText);
console.log('--- chat history ---');
console.log(txt.slice(0, 500));
console.log('--- /api/ request failures ---');
console.log(netErr.length ? netErr.join('\n') : 'none');
await b.close();
