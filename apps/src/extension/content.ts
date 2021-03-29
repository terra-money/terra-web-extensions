import { observeWalletStorage } from '@terra-dev/extension-wallet-storage';
import { browser } from 'webextension-polyfill-ts';
import { CONTENT_AND_BACKGROUND_CONNECTION_NAME } from './env';
import {
  isTerraConnectMessage,
  MessageType,
  TerraConnectMessage,
} from './models/message';

async function init() {
  // ---------------------------------------------
  // read connection info
  // ---------------------------------------------
  const meta = document.querySelector('head > meta[name="terra-connect"]');
  const connectId = meta?.getAttribute('content');

  if (!connectId) return;

  // ---------------------------------------------
  // install
  // ---------------------------------------------
  const script = document.createElement('script');
  script.setAttribute('src', browser.runtime.getURL('inpage.js'));
  document.head.append(script);

  const port = browser.runtime.connect(undefined, {
    name: CONTENT_AND_BACKGROUND_CONNECTION_NAME,
  });

  port.onMessage.addListener((message: any) => {
    if (!isTerraConnectMessage(message)) {
      return;
    }

    console.log('content.ts..() get message from background!', message);

    window.postMessage(message, '*');
  });

  window.addEventListener(
    'message',
    (event) => {
      if (!isTerraConnectMessage(event.data)) {
        return;
      }

      console.log('content.ts..() get message from inpage!', event.data);
      port.postMessage(event.data);
    },
    false,
  );

  observeWalletStorage().subscribe((wallets) => {
    window.postMessage(
      {
        connectId,
        type: MessageType.EXTENSION_STATE_UPDATED,
        payload: {
          wallets,
        },
      } as TerraConnectMessage,
      '*',
    );
    console.log('content.ts..()', wallets);
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
