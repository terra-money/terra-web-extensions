import { IFramePoppingModal, SvgIcon } from '@station/ui2';
import {
  SerializedCreateTxOptions,
  WebConnectorTxDenied,
  WebConnectorTxFail,
  WebConnectorTxProgress,
  WebConnectorTxResult,
  WebConnectorTxStatus,
  WebConnectorTxSucceed,
} from '@terra-dev/web-connector-interface';
import {
  findWallet,
  hasCW20Tokens,
  readSelectedNetwork,
  toURLSearchParams,
  TxRequest,
} from '@terra-dev/web-extension-backend';
import { createElement } from 'react';
import { render } from 'react-dom';
import { Observable } from 'rxjs';
import { browser } from 'webextension-polyfill-ts';
import { TerraIcon } from 'webextension/assets';
import { getDefaultNetworks } from 'webextension/queries/useDefaultNetworks';
import { contentScriptPortPrefix } from '../../env';
import {
  ContentScriptOptions,
  startWebExtensionContentScript,
} from './startWebExtensionContentScript';

const logo = createElement(SvgIcon, {
  width: 20,
  height: 20,
  children: createElement(TerraIcon),
});

const MODAL_WIDTH = 450;

function startTx(
  id: string,
  terraAddress: string,
  tx: SerializedCreateTxOptions,
): Observable<WebConnectorTxResult> {
  return new Observable<WebConnectorTxResult>((subscriber) => {
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
          const modal = createElement(IFramePoppingModal, {
            logo,
            src: `${txHtml}?${toURLSearchParams(txRequest)}`,
            onClose: () => {
              subscriber.next({
                status: WebConnectorTxStatus.DENIED,
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
          window.open(src, 'terra-station-tx');
        }

        // ---------------------------------------------
        // connect port (background -> content_script)
        // ---------------------------------------------
        const onMessage = (
          msg:
            | WebConnectorTxProgress
            | WebConnectorTxSucceed
            | WebConnectorTxFail
            | WebConnectorTxDenied,
        ) => {
          if (!msg.status) {
            return;
          }

          subscriber.next(msg);

          switch (msg.status) {
            case WebConnectorTxStatus.SUCCEED:
            case WebConnectorTxStatus.FAIL:
            case WebConnectorTxStatus.DENIED:
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

    const modal = createElement(IFramePoppingModal, {
      logo,
      src: `${html}?id=${id}&hostname=${hostname}`,
      title: 'Approve site',
      onClose: () => {
        resolve(false);
        endConnect();
      },
      width: `${MODAL_WIDTH}px`,
      height: '600px',
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
      try {
        window.document.querySelector('body')?.removeChild(modalContainer);
      } catch {}
      port.disconnect();
    };

    const html = browser.runtime.getURL('add-cw20-token.html');

    const modal = createElement(IFramePoppingModal, {
      logo,
      src: `${html}?id=${id}&chain-id=${chainID}&token-addrs=${tokenAddrs.join(
        ',',
      )}`,
      title: 'Add tokens',
      onClose: () => {
        hasCW20Tokens(chainID, tokenAddrs).then((hasTokens) => {
          resolve(hasTokens);
          try {
            window.document.querySelector('body')?.removeChild(modalContainer);
          } catch {}
          endConnect();
        });
      },
      width: `${MODAL_WIDTH}px`,
      height: '70vh',
      maxHeight: `${300 + tokenAddrs.length * 60}px`,
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
