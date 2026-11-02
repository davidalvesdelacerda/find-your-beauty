// Generates the icons of the test environment: the production icons with a "TEST" band, so the PWA installed from
// dev.findyourbeauty.com.br is not mistaken for the real app. Run it when public/icons changes; the output in
// scripts/icons-dev is committed and copied over the build by scripts/robots-dev.cjs.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const src = path.join(__dirname, '..', 'public', 'icons');
const out = path.join(__dirname, 'icons-dev');

(async () => {
  const browser = await chromium.launch();
  for (const file of fs.readdirSync(src).filter((f) => f.endsWith('.png'))) {
    const size = Number(/(\d+)\.png$/.exec(file)?.[1] ?? 180);
    const px = file.startsWith('apple') ? 180 : size;
    const data = fs.readFileSync(path.join(src, file)).toString('base64');
    const page = await browser.newPage({ viewport: { width: px, height: px } });
    await page.setContent(`<style>
      html,body{margin:0;background:transparent}
      .b{position:relative;width:${px}px;height:${px}px;background:url(data:image/png;base64,${data}) 0 0/100% 100%}
      .t{position:absolute;left:0;right:0;top:64%;height:20%;background:#d62839;color:#fff;display:flex;
        align-items:center;justify-content:center;font:800 ${px * 0.15}px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em}
    </style><div class="b"><div class="t">TEST</div></div>`);
    await page.screenshot({ path: path.join(out, file), omitBackground: true });
    await page.close();
  }
  await browser.close();
})();
