import {
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxResult,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
} from '@terra-dev/web-extension';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import {
  ContentScriptOptions,
  startWebExtensionContentScript,
} from './backend/startWebExtensionContentScript';
import { IFrameModal } from './components/modal/IFrameModal';
import { contentScriptPortPrefix, defaultNetworks } from './env';

function startTxWithIframeModal(
  id: string,
  terraAddress: string,
  network: WebExtensionNetworkInfo,
  tx: SerializedCreateTxOptions,
): Observable<WebExtensionTxResult> {
  return new Observable<WebExtensionTxResult>((subscriber) => {
    // ---------------------------------------------
    // assets
    // ---------------------------------------------
    const modalContainer = window.document.createElement('div');

    const port = browser.runtime.connect(undefined, {
      name: contentScriptPortPrefix + id,
    });

    // do not call before latest subscriber.next()
    const endTx = () => {
      window.document.querySelector('body')?.removeChild(modalContainer);
      port.disconnect();
      subscriber.unsubscribe();
    };

    // ---------------------------------------------
    // create and append modal
    // ---------------------------------------------
    const txHtml = browser.runtime.getURL('tx.html');

    const txBase64 = btoa(JSON.stringify(tx));
    const networkBase64 = btoa(JSON.stringify(network));

    const hostname = window.location.hostname;
    const timestamp = Date.now();

    const modal = createElement(IFrameModal, {
      src: `${txHtml}?id=${id}&terraAddress=${terraAddress}&network=${networkBase64}&tx=${txBase64}&hostname=${hostname}&timestamp=${timestamp}`,
      title: 'Tx',
      onClose: () => {
        subscriber.next({
          status: WebExtensionTxStatus.DENIED,
        });
        endTx();
      },
    });

    render(modal, modalContainer);
    window.document.querySelector('body')?.appendChild(modalContainer);

    // ---------------------------------------------
    // connect port (background -> content_script)
    // ---------------------------------------------
    const onMessage = (
      msg:
        | WebExtensionTxProgress
        | WebExtensionTxSucceed
        | WebExtensionTxFail
        | WebExtensionTxDenied,
    ) => {
      if (!msg.status) {
        return;
      }

      subscriber.next(msg);

      switch (msg.status) {
        case WebExtensionTxStatus.SUCCEED:
        case WebExtensionTxStatus.FAIL:
        case WebExtensionTxStatus.DENIED:
          endTx();
          break;
      }
    };

    port.onMessage.addListener(onMessage);
  });
}

function startConnectWithIframeModal(
  id: string,
  hostname: string,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const modalContainer = window.document.createElement('div');

    const port = browser.runtime.connect(undefined, {
      name: contentScriptPortPrefix + id,
    });

    const endConnect = () => {
      window.document.querySelector('body')?.removeChild(modalContainer);
      port.disconnect();
    };

    const connectHtml = browser.runtime.getURL('connect.html');

    const modal = createElement(IFrameModal, {
      src: `${connectHtml}?id=${id}&hostname=${hostname}`,
      title: 'Connect',
      onClose: () => {
        resolve(false);
        endConnect();
      },
    });

    render(modal, modalContainer);
    window.document.querySelector('body')?.appendChild(modalContainer);

    const onMessage = (msg: boolean) => {
      resolve(msg);
      endConnect();
    };

    port.onMessage.addListener(onMessage);
  });
}

const contentScriptOptions: ContentScriptOptions = {
  startTx: startTxWithIframeModal,
  startConnect: startConnectWithIframeModal,
  defaultNetworks,
};

if (document.readyState === 'loading') {
  window.addEventListener(
    'DOMContentLoaded',
    () => startWebExtensionContentScript(contentScriptOptions),
    {
      once: true,
    },
  );
} else {
  startWebExtensionContentScript(contentScriptOptions);
}
