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
    const svg = document.querySelector('.basics-progress-cycle__loop-svg');
    const pathEl = document.querySelector('.basics-progress-cycle__loop-path');
    const svgRect = svg.getBoundingClientRect();
    const start = pathEl.getPointAtLength(0);
    const end = pathEl.getPointAtLength(pathEl.getTotalLength());
    const ctm = pathEl.getScreenCTM();
    function toScreen(pt) {
      return { x: pt.x * ctm.a + pt.y * ctm.c + ctm.e, y: pt.x * ctm.b + pt.y * ctm.d + ctm.f };
    }
    const phases = Array.from(document.querySelectorAll('.basics-progress-cycle__phase')).map((el) => {
      const r = el.getBoundingClientRect();
      return (r.left + r.right) / 2;
    });
    return {
      svgRect: { left: svgRect.left, right: svgRect.right, width: svgRect.width },
      pathStartScreen: toScreen(start),
      pathEndScreen: toScreen(end),
      phaseCenters: phases,
      viewBox: svg.getAttribute('viewBox'),
    };
  });
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
