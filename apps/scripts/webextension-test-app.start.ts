import { start } from '@rocket-scripts/web';
import path from 'path';
import puppeteer from 'puppeteer';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  const remoteDebuggingPort: number = +(process.env.INSPECT_CHROME ?? 9222);

  const { port } = await start({
    app: 'webextension-test-app',
    staticFileDirectories: [
      path.resolve(__dirname, '../public/common'),
      path.resolve(__dirname, '../public/webextension-test-app'),
    ],
    webpackConfig: webpackPolyfills,
  });
  
  const extensionPath = path.resolve(__dirname, '../dev/webextension/');
  const extensionReloaderPath = path.resolve(__dirname, '../dev/webextension-reloader/');

  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, '../puppeteer-user-data'),
    headless: false,
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
  await page.goto(`http://localhost:${port}`);
})();
