#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const extensionPath = path.resolve(__dirname, './webextension/');

  const url =
    process.argv[2] ||
    'https://anchor-web-app-git-feature-wallet-connect-anchor-protocol.vercel.app/';

  const browser = await puppeteer.launch({
    userDataDir: process.env.EXTENSION_READY_CHROME_USER_DATA,
    headless: false,
    defaultViewport: null,
    args: [
      `--load-extension=${extensionPath}`,
      `--disable-extensions-except=${extensionPath}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
  });

  const page = await browser.newPage();
  await page.goto(url);

  console.log(
    `🌏 Test Chromium is ready. A shortcut "Ctrl + C" is close the browser.`,
  );
})();
