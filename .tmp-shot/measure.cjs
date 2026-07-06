const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1280, height: 1200, deviceScaleFactor: 2 });
  const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'basics.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    const toObj = (r) => ({ left: r.left, right: r.right, top: r.top, width: r.width });
    const row = document.querySelector('.basics-progress-cycle__loop-row');
    const rowRect = toObj(row.getBoundingClientRect());
    const phases = Array.from(document.querySelectorAll('.basics-progress-cycle__phase')).map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, center: (r.left + r.right) / 2 };
    });
    const svg = document.querySelector('.basics-progress-cycle__loop-svg');
    const svgRect = toObj(svg.getBoundingClientRect());
    return { rowRect, phases, svgRect };
  });
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
