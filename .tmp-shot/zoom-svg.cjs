const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200, deviceScaleFactor: 4 });
  await page.goto('file:///' + path.resolve(__dirname, '..', 'basics.html').replace(/\\/g, '/'), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('.basics-progress-cycle').scrollIntoView({ block: 'center' }));
  await new Promise((r) => setTimeout(r, 500));
  const svg = await page.$('.basics-progress-cycle__loop-svg');
  await svg.screenshot({ path: path.resolve(__dirname, 'loop-svg-zoom.png') });
  await browser.close();
})();
