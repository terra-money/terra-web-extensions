# Web Extension

```
# 👌🏻 This phase implement by @terra-dev/terra-connect-webextension
web app <- ( window.postMessage ) -> content_scripts

# 👌🏻 This phase implement internally
content_scripts <- ( browser.runtime.connect, tx.html ) -> browser.storage
```

## Steps

1. Webapp (TerraConnectWebExtensionClient) -> content_scripts (terra-connect-webextension/backend/contentScript)
   - They can't connect directly. They connected by `window.postMessage()`
2. content_scripts (terra-connect-webextension/backend/contentScript) -> content_scripts (webextension/content)
   - They are in same context. They connected by a callback function
3. content_scripts (webextension/content) -> (webextension/background) -> extension page (webextension/tx)
   - They can't connect directly. They connected by `browser.runtime.Port`
   - And, content_scripts and extension page can't connect directly by `browser.runtime.Port`. so background rebroadcast them. (it works like a chat server)