import { Network } from '@terra-dev/network';
import {
  ContentScriptOptions,
  initContentScript,
} from '@terra-dev/terra-connect-webextension/backend/contentScript';
import {
  SerializedTx,
  TxDenied,
  TxFail,
  TxProgress,
  TxStatus,
  TxSucceed,
} from '@terra-dev/tx';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import { TxModal } from 'webextension/components/TxModal';
import { contentScriptPortPrefix } from 'webextension/env';

function onTx(
  id: string,
  terraAddress: string,
  network: Network,
  tx: SerializedTx,
): Observable<TxProgress | TxSucceed | TxFail | TxDenied> {
  return new Observable<TxProgress | TxSucceed | TxFail | TxDenied>(
    (subscriber) => {
      const txHtml = browser.runtime.getURL('tx.html');

      const modal = window.document.createElement('div');

      const element = createElement(TxModal, {
        src: txHtml,
        id,
        terraAddress,
        network,
        tx,
        onClose: () => {
          window.document.querySelector('body')?.removeChild(modal);
          subscriber.next({
            status: TxStatus.DENIED,
          });
        },
      });

      const port = browser.runtime.connect(undefined, {
        name: contentScriptPortPrefix + id,
      });

      const onMessage = (msg: TxProgress | TxSucceed | TxFail | TxDenied) => {
        if (!msg.status) {
          return;
        }

        subscriber.next(msg);

        switch (msg.status) {
          case TxStatus.SUCCEED:
          case TxStatus.FAIL:
          case TxStatus.DENIED:
            window.document.querySelector('body')?.removeChild(modal);
            port.disconnect();
            break;
        }
      };

      port.onMessage.addListener(onMessage);

      render(element, modal);
      window.document.querySelector('body')?.appendChild(modal);
    },
  );
}

const contentScriptOptions: ContentScriptOptions = {
  onTx,
};

if (document.readyState === 'loading') {
  window.addEventListener(
    'DOMContentLoaded',
    () => initContentScript(contentScriptOptions),
    {
      once: true,
    },
  );
} else {
  initContentScript(contentScriptOptions);
}
