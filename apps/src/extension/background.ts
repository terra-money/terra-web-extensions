import { browser, Runtime } from 'webextension-polyfill-ts';
import { CONTENT_AND_BACKGROUND_CONNECTION_NAME } from './env';
import { isTerraConnectMessage } from './models/message';

const ports: Set<Runtime.Port> = new Set();

browser.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_AND_BACKGROUND_CONNECTION_NAME) {
    return;
  }

  ports.add(port);

  console.log('background.ts..()', port.name);

  port.onMessage.addListener((message: any) => {
    if (!isTerraConnectMessage(message)) {
      return;
    }

    console.log('background.ts..() get message from content', message);
  });

  port.onDisconnect.addListener((port) => {
    ports.delete(port);
  });
});
