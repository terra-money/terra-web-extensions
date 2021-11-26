# Run chromium browser installed the Terra Station extension for testing

# CLI

### Install

```sh
npm install -g terra-web-extension
```

### Command-line tool

```sh
# basic 
terra-web-extension https://localhost:3000
```

If you want to keep your chrome browser user data

```sh
terra-web-extension https://localhost:3000 --userData="/your/chromium/user-data-path"
```

### Pre-config test

```json
{
  "$schema": "https://assets.terra.money/schemas/web-extension-test-config.json",
  "wallets": [
    {
      "name": "validator",
      "mnemonic": "satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn"
    },
    {
      "name": "test1",
      "mnemonic": "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
    }
  ],
  "selectedWallet": "test1",
  "selectedNetwork": "testnet"
}
```

Create a config file like above

```sh
terra-web-extension https://localhost:3000 --config="./config.json"
```

Then, you can use the set extension immediately.

### Without `npm install -g`

```sh
npx terra-web-extension@latest https://localhost:3000
```

# API

### Install

```sh
npm install terra-web-extension --dev
```

### Script

```js
const runBrowser = require('terra-web-extension')

runBrowser('https://localhost:3000')
```

If you want to do a test with Terra Station extension to run another extension together (for extension developers)

```js
const runBrowser = require('terra-web-extension')

runBrowser('https://localhost:3000', {
  extensionPaths: [
    '/Your/extension/path1', // unpacked extension directories
    '/Your/extension/path2',
  ]
})
```

If you want to keep your chrome browser user data

```js
const runBrowser = require('terra-web-extension')

runBrowser('https://localhost:3000', {
  puppeteerLaunchOptions: {
    userDataDir: '/your/chromium/user-data-path',
  }
})
```

If you want to use pre-config json file

```js
const runBrowser = require('terra-web-extension')

runBrowser('https://localhost:3000', {
  configPath: './config.json',
})
```