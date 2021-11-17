import { clearStalePasswords } from '@terra-dev/web-extension-backend';
import { browser, Runtime } from 'webextension-polyfill-ts';
import {
  getIdFromContentScriptPort,
  getIdFromTxPort,
  isContentScriptPort,
  isTxPort,
} from '../../env';

const contentScriptPorts: Map<string, Runtime.Port> = new Map();

browser.runtime.onConnect.addListener((port) => {
  if (isContentScriptPort(port.name)) {
    contentScriptPorts.set(getIdFromContentScriptPort(port.name), port);
  } else if (isTxPort(port.name)) {
    const id = getIdFromTxPort(port.name);

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

const JOB_INTERVAL = 1000 * 30;

async function job() {
  try {
    await clearStalePasswords();
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(job, JOB_INTERVAL);
  }
}

job();
