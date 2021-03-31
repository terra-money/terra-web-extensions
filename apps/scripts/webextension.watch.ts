import { watch } from '@rocket-scripts/web';
import path from 'path';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await watch({
    app: 'webextension',
    staticFileDirectories: [
      path.resolve(__dirname, '../public/common'),
      path.resolve(__dirname, '../public/webextension'),
    ],
    isolatedScripts: {
      content: 'content.ts',
      background: 'background.ts',
    },
    webpackConfig: webpackPolyfills,
  });
})();
