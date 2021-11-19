const puppeteer = require('puppeteer');
const path = require('path');

module.exports = async (url, { extensionPaths, puppeteerLaunchOptions } = {}) => {
  const extensionPath = path.resolve(__dirname, './unpacked/');

  const extension = [extensionPath, ...extensionPaths].join(',');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      `--load-extension=${extension}`,
      `--disable-extensions-except=${extension}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    ...puppeteerLaunchOptions,
  });

  const page = await browser.newPage();
  await page.goto(url);

  console.log(
    `🌏 Test Chromium is ready. A shortcut "Ctrl + C" is close the browser.`,
  );
};
