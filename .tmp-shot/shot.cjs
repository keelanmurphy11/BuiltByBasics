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
  await page.waitForSelector('.basics-progress-cycle');
  const el = await page.$('.basics-progress-cycle');
  await el.screenshot({ path: path.resolve(__dirname, 'progress-cycle-desktop.png') });
  const loopRowEl = await page.$('.basics-progress-cycle__pipeline-wrap');
  await loopRowEl.screenshot({ path: path.resolve(__dirname, 'loop-arrow-zoom.png') });

  await page.setViewport({ width: 420, height: 1400, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  const el2 = await page.$('.basics-progress-cycle');
  await el2.screenshot({ path: path.resolve(__dirname, 'progress-cycle-mobile.png') });
  const chartEl = await page.$('.basics-progress-cycle__chart');
  await chartEl.screenshot({ path: path.resolve(__dirname, 'chart-mobile-zoom.png') });
  const loopEl = await page.$('.basics-progress-cycle__mobile-loop');
  await loopEl.screenshot({ path: path.resolve(__dirname, 'mobile-loop-zoom.png') });

  await page.setViewport({ width: 760, height: 1200, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  const loopRowEl2 = await page.$('.basics-progress-cycle__pipeline-wrap');
  await loopRowEl2.screenshot({ path: path.resolve(__dirname, 'loop-arrow-zoom-narrow.png') });

  await browser.close();
})();
