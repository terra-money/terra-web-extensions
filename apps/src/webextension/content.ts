import {
  ContentScriptOptions,
  initContentScript,
} from '@terra-dev/terra-connect-webextension/backend/content';
import {
  SerializedTx,
  TxDenied,
  TxFail,
  TxProgress,
  TxSucceed,
} from '@terra-dev/tx';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';

function onTx(
  terraAddress: string,
  tx: SerializedTx,
): Observable<TxProgress | TxSucceed | TxFail | TxDenied> {
  return new Observable<TxProgress | TxSucceed | TxFail | TxDenied>(
    (subscriber) => {
      const txHtml = browser.runtime.getURL('tx.html');
      const txBase64 = btoa(JSON.stringify(tx));
      
      const modal = window.document.createElement('div');
      const iframe = window.document.createElement('iframe');
      iframe.src = `${txHtml}?terraAddress=${terraAddress}&tx=${txBase64}`;
      
      modal.appendChild(iframe);
      
      window.document.appendChild(modal);
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
