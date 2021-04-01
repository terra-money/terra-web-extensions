import { build } from '@rocket-scripts/web';
import path from 'path';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await build({
    app: 'webextension-test-app',
    staticFileDirectories: [
      path.resolve(__dirname, '../public/common'),
      path.resolve(__dirname, '../public/webextension-test-app'),
    ],
    webpackConfig: webpackPolyfills,
  });
})();
