import path from 'path';
import puppeteer from 'puppeteer';

(async () => {
  const remoteDebuggingPort: number = +(process.env.INSPECT_CHROME ?? 9222);

  const extensionPath = path.resolve(__dirname, '../dev/webextension/');
  const extensionReloaderPath = path.resolve(
    __dirname,
    '../dev/webextension-reloader/',
  );

  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, '../puppeteer-user-data'),
    headless: false,
    //@ts-ignore
    defaultViewport: null,
    args: [
      '--start-fullscreen',
      `--remote-debugging-port=${remoteDebuggingPort}`,
      `--load-extension=${extensionPath},${extensionReloaderPath}`,
      `--disable-extensions-except=${extensionPath},${extensionReloaderPath}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    devtools: true,
  });

  const [page] = await browser.pages();
  await page.goto(process.env.URL ?? `https://app.anchorprotocol.com`);
})();
