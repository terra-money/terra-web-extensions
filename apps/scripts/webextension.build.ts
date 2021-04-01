import { build } from '@rocket-scripts/web';
import { execSync } from 'child_process';
import path from 'path';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  await build({
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

  const result = execSync(
    `zip -r ${path.resolve(
      __dirname,
      '../public/webextension-test-app/webextension.zip',
    )} ${path.resolve(__dirname, '../out/webextension')}`,
  );
  console.log(result.toString());
})();
