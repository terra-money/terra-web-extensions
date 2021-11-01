import { IFramePoppingModal } from '@station/ui';
import { createElement } from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { contentScriptPortPrefix } from 'webextension/env';
import { LOGO, MODAL_WIDTH } from '../env';

export function startConnect(id: string, hostname: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const modalContainer = window.document.createElement('div');

    const port = browser.runtime.connect(undefined, {
      name: contentScriptPortPrefix + id,
    });

    const endConnect = () => {
      window.document.querySelector('body')?.removeChild(modalContainer);
      port.disconnect();
    };

    const html = browser.runtime.getURL('app.html');

    const modal = createElement(IFramePoppingModal, {
      logo: LOGO,
      src: `${html}#/connect?id=${id}&hostname=${hostname}`,
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
