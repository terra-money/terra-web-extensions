import {
  clearPasswords,
  clearStalePasswords,
} from '@terra-dev/web-extension-backend';
import {
  migrateCW20StorageV0,
  migrateNetworkStorageV0,
  migrateWalletsStorageV0,
} from '@terra-dev/web-extension-backend/migrate';
import { browser, Runtime } from 'webextension-polyfill-ts';
import { getDefaultNetworks } from 'webextension/queries/useDefaultNetworks';
import {
  getIdFromContentScriptPort,
  getIdFromTxPort,
  isContentScriptPort,
  isTxInfoPort,
  isTxPort,
} from '../../env';

// ---------------------------------------------
// port
// ---------------------------------------------
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
  } else if (isTxInfoPort(port.name)) {
    console.log('index.ts..() ???', port.name);

    const onMessage = (msg: unknown) => {
      console.log('index.ts..onMessage()', msg);
    };

    const onDisconnect = () => {
      port.onMessage.removeListener(onMessage);
      port.onDisconnect.removeListener(onDisconnect);
    };

    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);
  }
});

// ---------------------------------------------
// hooks
// ---------------------------------------------
async function migration() {
  const defaultNetworks = await getDefaultNetworks();

  const teardowns = await Promise.all([
    migrateCW20StorageV0(),
    migrateNetworkStorageV0(defaultNetworks),
    migrateWalletsStorageV0(),
  ]);

  for (const teardown of teardowns) {
    teardown();
  }
}

browser.runtime.onInstalled.addListener(({ reason }) => {
  // migration test
  //setDummyDataV0();
  //migration();

  if (reason !== 'install') {
    console.log('EXTENSION UPDATED: start data migration');
    migration();
  } else if (reason === 'install' && process.env.NODE_ENV === 'production') {
    console.log('EXTENSION INSTALLED: open welcome page');
    browser.tabs.create({
      url: browser.runtime.getURL('app.html#/welcome'),
    });
  }
});

browser.runtime.onStartup.addListener(() => {
  console.log('EXTENSION STARTUP: clear all passwords');
  clearPasswords();
});

// ---------------------------------------------
// jobs
// ---------------------------------------------
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
