const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = '/home/claude/coolbird/site';
// google<hash>.html is Search Console's ownership token, not a page —
// it has no H1 or schema by design.
const pages = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.html') && !/^google[a-f0-9]+\.html$/.test(f));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**fonts.googleapis.com**', r => r.abort());
  await ctx.route('**fonts.gstatic.com**', r => r.abort()); const bad = [];
  for (const f of pages) {
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push('JS ' + e.message));
    await p.goto('file://' + path.join(DIR, f), { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(120);
    for (const h of await p.$$eval('a[href]', a => a.map(x => x.getAttribute('href')))) {
      if (/^(https?:|mailto:|tel:|#)/.test(h)) continue;
      const tgt = h.split('#')[0].replace(/^\//, '');
      if (tgt === '') continue;
      if (!fs.existsSync(path.join(DIR, tgt)) && !fs.existsSync(path.join(DIR, tgt + '.html')))
        bad.push(`${f} -> missing ${h}`);
    }
    if (!(await p.$('h1'))) bad.push(`${f}: no H1`);
    const t = await p.title(); if (t.length > 65) bad.push(`${f}: title ${t.length} chars`);
    try { JSON.parse(await p.$eval('script[type="application/ld+json"]', e => e.textContent)); }
    catch (e) { bad.push(`${f}: bad JSON-LD`); }
    for (const w of [1280, 390]) {
      await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(150);
      const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 1) bad.push(`${f} @${w}px overflow ${o}px`);
    }
    if (errs.length) bad.push(`${f}: ${errs.join('|')}`);
    await p.close();
  }
  await b.close();
  console.log(`${pages.length} pages checked`);
  console.log(bad.length ? 'PROBLEMS:\n' + bad.join('\n') : 'ALL CHECKS PASSED');
})();
