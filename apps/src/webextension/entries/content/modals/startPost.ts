import { IFramePoppingModal } from '@station/ui';
import {
  SerializedCreateTxOptions,
  WebExtensionPostPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxResult,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
} from '@terra-dev/web-extension-interface';
import {
  deregisterAllowCommandId,
  findWallet,
  readSelectedNetwork,
  registerAllowCommandId,
  toURLSearchParams,
  TxRequest,
} from '@terra-dev/web-extension-backend';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import { CONTENT_SCRIPT_PORT_PREFIX } from 'webextension/env';
import { getDefaultNetworks } from 'webextension/queries/useDefaultNetworks';
import { LOGO, MODAL_WIDTH } from '../env';

export function startPost(
  id: string,
  terraAddress: string,
  tx: SerializedCreateTxOptions,
): Observable<WebExtensionTxResult<WebExtensionPostPayload>> {
  registerAllowCommandId(id);

  return new Observable<WebExtensionTxResult<WebExtensionPostPayload>>(
    (subscriber) => {
      getDefaultNetworks()
        .then((defaultNetworks) => {
          return Promise.all([
            readSelectedNetwork(defaultNetworks),
            findWallet(terraAddress),
          ]);
        })
        .then(([network, wallet]) => {
          if (!wallet) {
            subscriber.error(new Error(`Can't find wallet ${terraAddress}`));
            return;
          }

          const isPopup = 'usbDevice' in wallet;

          // ---------------------------------------------
          // assets
          // ---------------------------------------------
          const modalContainer = !isPopup
            ? window.document.createElement('div')
            : null;

          const port = browser.runtime.connect(undefined, {
            name: CONTENT_SCRIPT_PORT_PREFIX + id,
          });

          // do not call before latest subscriber.next()
          const endTx = () => {
            if (modalContainer) {
              window.document
                .querySelector('body')
                ?.removeChild(modalContainer);
            }
            port.disconnect();
            subscriber.unsubscribe();
            deregisterAllowCommandId(id);
          };

          // ---------------------------------------------
          // create and append modal
          // ---------------------------------------------
          const txHtml = browser.runtime.getURL('app.html');

          const txRequest: TxRequest = {
            id,
            terraAddress,
            network,
            tx,
            hostname: window.location.hostname,
            date: new Date(),
            closeWindowAfterTx: isPopup,
          };

          const src = `${txHtml}#/tx/post?${toURLSearchParams(txRequest)}`;

          if (modalContainer) {
            const modal = createElement(IFramePoppingModal, {
              logo: LOGO,
              src,
              onClose: () => {
                subscriber.next({
                  status: WebExtensionTxStatus.DENIED,
                });
                endTx();
              },
              width: `${MODAL_WIDTH}px`,
              height: '70vh',
              maxHeight: '800px',
            });

            render(modal, modalContainer);
            window.document.querySelector('body')?.appendChild(modalContainer);
          } else {
            window.open(src, 'terra-station-tx-post');
          }

          // ---------------------------------------------
          // connect port (background -> content_script)
          // ---------------------------------------------
          const onMessage = (
            msg:
              | WebExtensionTxProgress
              | WebExtensionTxSucceed<WebExtensionPostPayload>
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
    },
  );
}
