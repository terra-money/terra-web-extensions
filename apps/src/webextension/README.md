# Web Extension

## Messaging relay

```
@terra-money/wallet-provider (WalletController)
<-> @terra-dev/web-connector-controller (WebConnectorController) 
<-> webextension/entries/inpage (WebExtensionController implements TerraWebConnector) 
<-> webextension/entries/content
<-> @terra-dev/web-extension-backend
```

## Internal initialize steps

1. Extension check if the dApp has `<meta name="terra-web-connect" />`
   - If not extension do nothing
2. Extension inject the `inpage.js (WebExtensionController)` to dApp
3. `WebConnectorController` catch the `window.terraWebConnectors` and then initialize it
4. Finally, `WalletController` connect to Extension through the `WebConnectorController`