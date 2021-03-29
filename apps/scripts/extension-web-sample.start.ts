import { start } from '@rocket-scripts/web';
import path from 'path';
import puppeteer from 'puppeteer';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  const remoteDebuggingPort: number = +(process.env.INSPECT_CHROME ?? 9222);

  const { port } = await start({
    app: 'extension-web-sample',
    staticFileDirectories: [
      path.resolve(__dirname, '../public/common'),
      path.resolve(__dirname, '../public/extension-web-sample'),
    ],
    webpackConfig: webpackPolyfills,
  });

  const browser = await puppeteer.launch({
    userDataDir: process.env.CHROMIUM_USER_DATA_DEBUG,
    headless: false,
    defaultViewport: null,
    args: [
      '--start-fullscreen',
      `--remote-debugging-port=${remoteDebuggingPort}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    devtools: true,
  });

  const [page] = await browser.pages();
  await page.goto(`http://localhost:${port}`);
})();
