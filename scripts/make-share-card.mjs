// Renders a 1200x630 branded share card (glitch art + DREAMERS wordmark) and screenshots it.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pptr = require('C:/Users/Brittany/Desktop/SHADDAI MASTER FINAL BUILD/node_modules/puppeteer-core');

const art = 'file://' + path.resolve('dashboard/assets/collection/synthesis-matrix.png').replace(/\\/g, '/');
const out = path.resolve('dashboard/assets/share/dreamers.png');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
#card{width:1200px;height:630px;background:#08060f;position:relative;overflow:hidden;font-family:Georgia,'Times New Roman',serif;color:#fff}
.art{position:absolute;right:-80px;top:-120px;width:760px;height:760px;object-fit:cover;opacity:.4;image-rendering:pixelated}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#08060f 32%,rgba(8,6,15,.2) 75%),radial-gradient(70% 90% at 18% 55%,rgba(138,92,246,.4),transparent 60%)}
.grain{position:absolute;inset:0;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.wrap{position:absolute;left:80px;top:196px;z-index:2}
.ey{font-family:'Courier New',monospace;letter-spacing:9px;color:#b78bff;font-size:19px;text-transform:uppercase}
.wm{font-size:158px;font-weight:400;letter-spacing:-4px;line-height:.9;margin-top:14px;background:linear-gradient(180deg,#fff,#c9b8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:#d7cfe6;font-size:27px;margin-top:22px;max-width:640px;line-height:1.3}
.foot{position:absolute;left:82px;bottom:48px;z-index:2;font-family:'Courier New',monospace;color:#84f4e2;letter-spacing:5px;font-size:18px}
</style></head><body>
<div id="card">
  <img class="art" src="${art}">
  <div class="fade"></div><div class="grain"></div>
  <div class="wrap">
    <div class="ey">the culture of creation</div>
    <div class="wm">DREAMERS</div>
    <div class="sub">Make music, art &amp; worlds — with an AI council at your side.</div>
  </div>
  <div class="foot">@DreamersOnSol&nbsp;&nbsp;·&nbsp;&nbsp;dreamers-i5nj.onrender.com</div>
</div>
</body></html>`;

const b = await pptr.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const pg = await b.newPage();
await pg.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await pg.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 400));
await pg.$eval('#card', el => el.getBoundingClientRect());
await (await pg.$('#card')).screenshot({ path: out });
console.log('saved', out);
await b.close();
