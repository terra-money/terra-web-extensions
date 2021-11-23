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
EXTENSION_READY_CHROME_USER_DATA="/your/chromium/user-data-path" terra-web-extension https://localhost:3000
```

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