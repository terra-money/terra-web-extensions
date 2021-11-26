const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');
const process = require('process');
const os = require('os');
const { v4: uuid } = require('uuid');

const STORAGE = path.join(os.homedir(), '.terra-web-extension');
const STORAGE_CONFIG = path.join(STORAGE, '.config.json');

module.exports = async (
  url,
  { extensionPaths = [], puppeteerLaunchOptions = {}, configPath } = {},
) => {
  const unpackedExtensionPath = path.resolve(__dirname, './unpacked/');

  let extensionPath = unpackedExtensionPath;

  if (configPath) {
    // get extension path
    const absoluteConfigPath = path.resolve(process.cwd(), configPath);

    const storageConfig = fs.pathExistsSync(STORAGE_CONFIG)
      ? await fs.readJson(STORAGE_CONFIG)
      : {};

    const directoryId = storageConfig[absoluteConfigPath] ?? uuid();

    extensionPath = path.resolve(STORAGE, directoryId);

    // copy files
    await fs.copy(unpackedExtensionPath, extensionPath, {
      overwrite: true,
      dereference: true,
    });

    // write manifest.json
    const manifest = await fs.readJson(
      path.resolve(unpackedExtensionPath, 'manifest.json'),
    );

    const testConfig = await fs.readJson(absoluteConfigPath);

    const nextManifest = {
      ...manifest,
      terra_test_config: testConfig,
    };

    await fs.writeJson(
      path.resolve(extensionPath, 'manifest.json'),
      nextManifest,
      {
        spaces: 2,
      },
    );

    // write storage config
    const nextStorageConfig = {
      ...storageConfig,
      [absoluteConfigPath]: directoryId,
    };

    await fs.writeJson(STORAGE_CONFIG, nextStorageConfig, {
      spaces: 2,
    });
  }

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
    [
      `🌏 Test Chromium is ready. A shortcut "Ctrl + C" is close the browser.`,
      `📝 If there's a problem with using this, please report it on https://github.com/terra-money/terra-web-extensions/issues`,
    ].join('\n'),
  );
};
