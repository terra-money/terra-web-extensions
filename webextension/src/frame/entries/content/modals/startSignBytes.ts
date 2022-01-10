import { IFramePoppingModal } from '@station/ui';
import {
  deregisterAllowCommandId,
  findWallet,
  registerAllowCommandId,
  SignBytesRequest,
  signBytesRequestToURLSearchParams,
} from '@terra-dev/web-extension-backend';
import {
  WebExtensionSignBytesPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxResult,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
} from '@terra-dev/web-extension-interface';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import { CONTENT_SCRIPT_PORT_PREFIX } from 'frame/env';
import { LOGO, MODAL_WIDTH } from '../env';

export function startSignBytes(
  id: string,
  terraAddress: string,
  bytes: Buffer,
): Observable<WebExtensionTxResult<WebExtensionSignBytesPayload>> {
  registerAllowCommandId(id);

  return new Observable<WebExtensionTxResult<WebExtensionSignBytesPayload>>(
    (subscriber) => {
      findWallet(terraAddress).then((wallet) => {
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
            window.document.querySelector('body')?.removeChild(modalContainer);
          }
          port.disconnect();
          subscriber.unsubscribe();
          deregisterAllowCommandId(id);
        };

        // ---------------------------------------------
        // create and append modal
        // ---------------------------------------------
        const txHtml = browser.runtime.getURL('app.html');

        const signBytesRequest: SignBytesRequest = {
          id,
          terraAddress,
          bytes,
          hostname: window.location.hostname,
          date: new Date(),
          closeWindowAfterTx: isPopup,
        };

        const src = `${txHtml}#/tx/sign-bytes?${signBytesRequestToURLSearchParams(
          signBytesRequest,
        )}`;

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
          window.open(src, 'terra-station-tx-sign-bytes');
        }

        // ---------------------------------------------
        // connect port (background -> content_script)
        // ---------------------------------------------
        const onMessage = (
          msg:
            | WebExtensionTxProgress
            | WebExtensionTxSucceed<WebExtensionSignBytesPayload>
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
