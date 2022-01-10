import puppeteer from 'puppeteer';

const remoteDebuggingPort = +(process.env.INSPECT_CHROME ?? 9222);

const extensionPath = path.resolve(__dirname, '../webextension/dev');

const extensionReloaderPath = path.resolve(
  __dirname,
  '../webextension-reloader/out',
);

const extensionReloaderExists = fs.existsSync(extensionReloaderPath);

const extensionPaths = `${extensionPath}${
  extensionReloaderExists ? ',' + extensionReloaderPath : ''
}`;

const userDataDir = !!process.env.EMPTY_USER_DATA
  ? undefined
  : path.join(__dirname, '../puppeteer-user-data');

if (userDataDir && !fs.existsSync(userDataDir)) {
  fs.mkdirpSync(userDataDir);
}

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
