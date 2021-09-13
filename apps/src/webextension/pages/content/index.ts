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
import {
  findWallet,
  toURLSearchParams,
  TxRequest,
} from '@terra-dev/web-extension-backend';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import {
  ContentScriptOptions,
  startWebExtensionContentScript,
} from './startWebExtensionContentScript';
import { IFrameModal } from '../../components/modal/IFrameModal';
import { contentScriptPortPrefix, DEFAULT_NETWORKS } from '../../env';

function startTx(
  id: string,
  terraAddress: string,
  network: WebExtensionNetworkInfo,
  tx: SerializedCreateTxOptions,
): Observable<WebExtensionTxResult> {
  return new Observable<WebExtensionTxResult>((subscriber) => {
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
        name: contentScriptPortPrefix + id,
      });

      // do not call before latest subscriber.next()
      const endTx = () => {
        if (modalContainer) {
          window.document.querySelector('body')?.removeChild(modalContainer);
        }
        port.disconnect();
        subscriber.unsubscribe();
      };

      // ---------------------------------------------
      // create and append modal
      // ---------------------------------------------
      const txHtml = browser.runtime.getURL('tx.html');

      const txRequest: TxRequest = {
        id,
        terraAddress,
        network,
        tx,
        hostname: window.location.hostname,
        date: new Date(),
        closeWindowAfterTx: isPopup,
      };

      const src = `${txHtml}?${toURLSearchParams(txRequest)}`;

      if (modalContainer) {
        const modal = createElement(IFrameModal, {
          src: `${txHtml}?${toURLSearchParams(txRequest)}`,
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
      } else {
        window.open(src, 'terra-station-tx');
      }

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

    const html = browser.runtime.getURL('connect.html');

    const modal = createElement(IFrameModal, {
      src: `${html}?id=${id}&hostname=${hostname}`,
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

function startAddCW20TokenWithIframeModal(
  id: string,
  chainID: string,
  ...tokenAddrs: string[]
): Promise<{ [tokenAddr: string]: boolean }> {
  return new Promise<{ [tokenAddr: string]: boolean }>((resolve) => {
    const modalContainer = window.document.createElement('div');

    const port = browser.runtime.connect(undefined, {
      name: contentScriptPortPrefix + id,
    });

    const endConnect = () => {
      window.document.querySelector('body')?.removeChild(modalContainer);
      port.disconnect();
    };

    const html = browser.runtime.getURL('add-cw20-token.html');

    const modal = createElement(IFrameModal, {
      src: `${html}?id=${id}&chain-id=${chainID}&token-addrs=${tokenAddrs.join(
        ',',
      )}`,
      title: 'Add CW20 Tokens',
      onClose: () => {
        window.document.querySelector('body')?.removeChild(modalContainer);
        endConnect();
      },
    });

    render(modal, modalContainer);
    window.document.querySelector('body')?.appendChild(modalContainer);

    const onMessage = (msg: { [tokenAddr: string]: boolean }) => {
      resolve(msg);
      endConnect();
    };

    port.onMessage.addListener(onMessage);
  });
}

const contentScriptOptions: ContentScriptOptions = {
  startTx: startTx,
  startConnect: startConnectWithIframeModal,
  startAddCW20Token: startAddCW20TokenWithIframeModal,
  defaultNetworks: DEFAULT_NETWORKS,
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
