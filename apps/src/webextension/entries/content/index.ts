import { startAddCW20Tokens } from './modals/startAddCW20Tokens';
import { startAddNetwork } from './modals/startAddNetwork';
import { startConnect } from './modals/startConnect';
import { startTx } from './modals/startTx';
import {
  ContentScriptOptions,
  startWebExtensionContentScript,
} from './startWebExtensionContentScript';

const contentScriptOptions: ContentScriptOptions = {
  startTx,
  startConnect,
  startAddCW20Tokens,
  startAddNetwork,
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
