import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

(async () => {
  const remoteDebuggingPort: number = +(process.env.INSPECT_CHROME ?? 9222);

  const extensionPath = path.resolve(__dirname, '../dev/webextension/');
  const extensionReloaderPath = path.resolve(
    __dirname,
    '../dev/webextension-reloader/',
  );

  const extensionReloaderExists = fs.existsSync(extensionReloaderPath);

  const extensionPaths = `${extensionPath}${
    extensionReloaderExists ? ',' + extensionReloaderPath : ''
  }`;

  const userDataDir = !!process.env.EMPTY_USER_DATA
    ? path.join(
        __dirname,
        '../puppeteer-dummy-user-datas',
        'user' + Math.floor(Math.random() * 100),
      )
    : path.join(__dirname, '../puppeteer-user-data');

  const browser = await puppeteer.launch({
    userDataDir,
    headless: false,
    //@ts-ignore
    defaultViewport: null,
    args: [
      '--start-fullscreen',
      `--remote-debugging-port=${remoteDebuggingPort}`,
      `--load-extension=${extensionPaths}`,
      `--disable-extensions-except=${extensionPaths}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    devtools: true,
  });

  const [page] = await browser.pages();
  await page.goto(process.env.URL ?? `https://app.anchorprotocol.com`);
})();
