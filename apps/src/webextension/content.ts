import { initContentScript } from '@terra-dev/terra-connect-webextension/backend/content';

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initContentScript, {
    once: true,
  });
} else {
  initContentScript();
}
