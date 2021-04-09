#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const extensionPath = path.resolve(__dirname, './webextension/');

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
  await page.goto(
    'https://anchor-web-app-git-feature-support-new-extension-anchor-2216ab.vercel.app/',
  );
  
  console.log(`🌏 Test Chromium is ready (maybe?). A shortcut "Ctrl + C" is close the browser.`);
})();
