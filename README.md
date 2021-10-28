> This is still under development. Disclosure of this Repo is intended to provide references to Web Extension-compatible Wallet developers.

# Development

## 1. Run development

```sh
yarn install
cd apps
yarn run start
```

## 2-1. Chrome

You don't need to setting on chrome browser.

When you run `yarn run start` script, you can get a chromium browser with setted the dev extension.

## 2-2. Firefox

1. Go to `about:debugging`
2. Go to "This firefox"
3. Click "Load Temporary Add-on"
4. Choose the `~/apps/dev/webextension` directory

## 2-3. Safari

1. Allow `Develop / Allow Unsigned Extensions` on the Safari Menubar
2. Open XCode project the `~/safari-webextension/terra-connect`
3. Run
