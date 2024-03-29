import { startAddCW20Tokens } from './modals/startAddCW20Tokens';
import { startAddNetwork } from './modals/startAddNetwork';
import { startConnect } from './modals/startConnect';
import { startPost } from './modals/startPost';
import { startSign } from './modals/startSign';
import { startSignBytes } from './modals/startSignBytes';
import { ContentScriptOptions, startContentScript } from './startContentScript';

const contentScriptOptions: ContentScriptOptions = {
  startPost,
  startSign,
  startSignBytes,
  startConnect,
  startAddCW20Tokens,
  startAddNetwork,
};

if (document.readyState === 'loading') {
  window.addEventListener(
    'DOMContentLoaded',
    () => startContentScript(contentScriptOptions),
    {
      once: true,
    },
  );
} else {
  startContentScript(contentScriptOptions);
}
