import { Network } from '@terra-dev/network';
import {
  ContentScriptOptions,
  initContentScriptAndWebappConnection,
} from '@terra-dev/terra-connect-webextension/backend/contentScript';
import {
  SerializedTx,
  TxDenied,
  TxFail,
  TxProgress,
  TxResult,
  TxStatus,
  TxSucceed,
} from '@terra-dev/tx';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import { IFrameModal } from 'webextension/components/IFrameModal';
import { contentScriptPortPrefix } from 'webextension/env';

function startTxWithIframeModal(
  id: string,
  terraAddress: string,
  network: Network,
  tx: SerializedTx,
): Observable<TxResult> {
  return new Observable<TxResult>((subscriber) => {
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

    const origin = window.location.hostname;
    const timestamp = Date.now();

    const modal = createElement(IFrameModal, {
      src: `${txHtml}?id=${id}&terraAddress=${terraAddress}&network=${networkBase64}&tx=${txBase64}&origin=${origin}&timestamp=${timestamp}`,
      title: 'Tx',
      onClose: () => {
        subscriber.next({
          status: TxStatus.DENIED,
        });
        endTx();
      },
    });

    render(modal, modalContainer);
    window.document.querySelector('body')?.appendChild(modalContainer);

    // ---------------------------------------------
    // connect port (content_script -> background)
    // ---------------------------------------------
    const onMessage = (msg: TxProgress | TxSucceed | TxFail | TxDenied) => {
      if (!msg.status) {
        return;
      }

      subscriber.next(msg);

      switch (msg.status) {
        case TxStatus.SUCCEED:
        case TxStatus.FAIL:
        case TxStatus.DENIED:
          endTx();
          break;
      }
    };

    port.onMessage.addListener(onMessage);
  });
}

const contentScriptOptions: ContentScriptOptions = {
  startTx: startTxWithIframeModal,
};

if (document.readyState === 'loading') {
  window.addEventListener(
    'DOMContentLoaded',
    () => initContentScriptAndWebappConnection(contentScriptOptions),
    {
      once: true,
    },
  );
} else {
  initContentScriptAndWebappConnection(contentScriptOptions);
}
