import { startAddCW20Tokens } from './modals/startAddCW20Tokens';
import { startAddNetwork } from './modals/startAddNetwork';
import { startConnect } from './modals/startConnect';
import { startPost } from './modals/startPost';
import { startSign } from './modals/startSign';
import {
  ContentScriptOptions,
  startWebExtensionContentScript,
} from './startWebExtensionContentScript';

const contentScriptOptions: ContentScriptOptions = {
  startPost,
  startSign,
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
