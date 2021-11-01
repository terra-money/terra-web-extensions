import { IFramePoppingModal } from '@station/ui';
import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { createElement } from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { contentScriptPortPrefix } from 'webextension/env';
import { LOGO, MODAL_WIDTH } from '../env';

export function startAddNetwork(
  id: string,
  network: WebConnectorNetworkInfo,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
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

    const html = browser.runtime.getURL('app.html');

    const modal = createElement(IFramePoppingModal, {
      logo: LOGO,
      src: `${html}#/add-network?id=${id}&name=${network.name}&chain-id=${network.chainID}&lcd=${network.lcd}`,
      title: 'Add network',
      onClose: () => {
        resolve(false);
        try {
          window.document.querySelector('body')?.removeChild(modalContainer);
        } catch {}
        endConnect();
      },
      width: `${MODAL_WIDTH}px`,
      height: '300px',
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
