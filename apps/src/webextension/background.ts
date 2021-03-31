import { browser, Runtime } from 'webextension-polyfill-ts';

const contentScriptPorts: Map<string, Runtime.Port> = new Map();

browser.runtime.onConnect.addListener((port) => {
  if (/content-[0-9]+/.test(port.name)) {
    contentScriptPorts.set(port.name.substr(8), port);
  } else if (/tx-[0-9]+/.test(port.name)) {
    const id = port.name.substr(3);

    const onMessage = (msg: unknown) => {
      const contentScriptPort = contentScriptPorts.get(id);

      if (contentScriptPort) {
        contentScriptPort.postMessage(msg);
      }
    };

    const onDisconnect = () => {
      port.onMessage.removeListener(onMessage);
      port.onDisconnect.removeListener(onDisconnect);

      const contentScriptPort = contentScriptPorts.get(id);

      if (contentScriptPort) {
        contentScriptPorts.delete(id);
        contentScriptPort.disconnect();
      }
    };

    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);
  }
});
