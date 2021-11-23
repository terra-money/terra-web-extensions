#!/usr/bin/env node

const runBrowser = require('./index');

const url = process.argv[2] || 'https://app.anchorprotocol.com';

runBrowser(url, {
  puppeteerLaunchOptions: {
    userDataDir: process.env.EXTENSION_READY_CHROME_USER_DATA,
  }
})
