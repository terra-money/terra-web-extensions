# Process

- [x] Tx
    - [x] `execute(Tx, { wait }): Observable<TxProgress | TxSuccess | TxFail | TxDeny | TxResult>`
        - TxProgress : in progress tx `{...}`
        - TxSuccess : success `{txhash}`
        - TxFail : fail `{error}`
        - TxDeny : user denied (cancel tx)
        - TxResult : if execute with wait option `{ txResult... }`
        - Stream : `TxProgress -> (TxSuccess | TxFail | TxDeny) -> [TxResult]`
    - [x] Open exetension web accessible html page with `<iframe>` modal
- [x] Add / Remove network
- [ ] Display Assets
- [ ] Send Assets (Is it required? just link to terraswap webapp?)

# Renewal Webapps

- [ ] app.anchorprotocol.com

# Automation

- [ ] Chrome <https://github.com/DrewML/chrome-webstore-upload>
- [ ] Firefox <https://github.com/erikdesjardins/firefox-extension-deploy/blob/master/index.js>
- [ ] Safari ???????
    - [ ] Is it possible development without XCode?
    - [ ] Is it possible build in CLI?

# Migration

- [ ] runtime.connect(`Terra Station`) and get Wallets
    1. Click "Get data from Terra Station"
    2. `runtime.connect()` and request wallet datas
    3. Input wallet password
    
# Extend

- [ ] `@terra-dev/terra-connect-electron` Embed to electron app
- [ ] `@terra-dev/terra-connect-webview` Embed to mobile apps
- [ ] `@terra-dev/terra-connect-appschema` Any clients