import { IFramePoppingModal } from '@station/ui';
import {
  deregisterAllowCommandId,
  hasCW20Tokens,
  registerAllowCommandId,
} from '@terra-dev/web-extension-backend';
import { createElement } from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { contentScriptPortPrefix } from 'webextension/env';
import { LOGO, MODAL_WIDTH } from '../env';

export function startAddCW20Tokens(
  id: string,
  chainID: string,
  ...tokenAddrs: string[]
): Promise<{ [tokenAddr: string]: boolean }> {
  registerAllowCommandId(id);

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
      deregisterAllowCommandId(id);
    };

    const html = browser.runtime.getURL('app.html');

    const modal = createElement(IFramePoppingModal, {
      logo: LOGO,
      src: `${html}#/add-cw20-token?id=${id}&chain-id=${chainID}&token-addrs=${tokenAddrs.join(
        ',',
      )}`,
      title: 'Add tokens',
      onClose: () => {
        hasCW20Tokens(chainID, tokenAddrs).then((hasTokens) => {
          resolve(hasTokens);
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
