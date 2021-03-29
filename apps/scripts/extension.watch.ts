import { watch } from '@rocket-scripts/web';
import path from 'path';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await watch({
    app: 'extension',
    staticFileDirectories: [
      path.resolve(__dirname, '../public/common'),
      path.resolve(__dirname, '../public/extension'),
    ],
    isolatedScripts: {
      content: 'content.ts',
      background: 'background.ts',
      inpage: 'inpage.tsx',
    },
    webpackConfig: webpackPolyfills,
  });
})();
