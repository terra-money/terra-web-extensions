#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const runBrowser = require('./index');

const {
  _: [url],
  config,
  userData,
} = yargs(hideBin(process.argv))
  .command(
    '<url>',
    'Start browser that installed extension',
    () => {},
    (argv) => {
      console.info(argv);
    },
  )
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Test config json path',
  })
  .option('userData', {
    alias: 'u',
    type: 'string',
    description: 'Chrome userDataDir path',
  })
  .demandCommand(1)
  .parse();

runBrowser(url, {
  puppeteerLaunchOptions: {
    userDataDir: userData ?? process.env.EXTENSION_READY_CHROME_USER_DATA,
  },
  configPath: config,
});
