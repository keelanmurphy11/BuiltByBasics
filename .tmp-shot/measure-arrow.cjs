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
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.basics-progress-cycle__loop-arrowhead');
  await page.evaluate(() => {
    document.querySelector('.basics-progress-cycle').scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 300));

  const data = await page.evaluate(() => {
    const pathEl = document.querySelector('.basics-progress-cycle__loop-path');
    const arrow = document.querySelector('.basics-progress-cycle__loop-arrowhead');
    const pathCtm = pathEl.getScreenCTM();
    const arrowCtm = arrow.getScreenCTM();
    const end = pathEl.getPointAtLength(pathEl.getTotalLength());
    const endScreen = { x: end.x * pathCtm.a + end.y * pathCtm.c + pathCtm.e, y: end.x * pathCtm.b + end.y * pathCtm.d + pathCtm.f };
    const pts = arrow.points;
    const arrowPts = [];
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      arrowPts.push({
        x: pt.x * arrowCtm.a + pt.y * arrowCtm.c + arrowCtm.e,
        y: pt.x * arrowCtm.b + pt.y * arrowCtm.d + arrowCtm.f,
      });
    }
    const baseLeft = arrowPts[0];
    const tip = arrowPts[1];
    const baseRight = arrowPts[2];
    return {
      pathEnd: endScreen,
      arrowBaseCenter: { x: (baseLeft.x + baseRight.x) / 2, y: (baseLeft.y + baseRight.y) / 2 },
      arrowPts,
      deltaX: endScreen.x - (baseLeft.x + baseRight.x) / 2,
      deltaY: endScreen.y - (baseLeft.y + baseRight.y) / 2,
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
