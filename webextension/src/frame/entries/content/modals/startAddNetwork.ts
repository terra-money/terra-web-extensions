import { IFramePoppingModal } from '@station/ui';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';
import {
  deregisterAllowCommandId,
  registerAllowCommandId,
} from '@terra-dev/web-extension-backend';
import { createElement } from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { CONTENT_SCRIPT_PORT_PREFIX } from 'frame/env';
import { LOGO, MODAL_WIDTH } from '../env';

export function startAddNetwork(
  id: string,
  network: WebExtensionNetworkInfo,
): Promise<boolean> {
  registerAllowCommandId(id);

  return new Promise<boolean>((resolve) => {
    const modalContainer = window.document.createElement('div');

    const port = browser.runtime.connect(undefined, {
      name: CONTENT_SCRIPT_PORT_PREFIX + id,
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
      src: `${html}#/add-network?id=${id}&name=${network.name}&chain-id=${network.chainID}&lcd=${network.lcd}`,
      title: 'Add network',
      onClose: () => {
        resolve(false);
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
