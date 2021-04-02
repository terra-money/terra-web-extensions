import { build } from '@rocket-scripts/web';
import { execSync } from 'child_process';
import path from 'path';
import rimraf from 'rimraf';
import { webpackPolyfills } from './webpackPolyfills';

(async () => {
  const zip = path.resolve(
    __dirname,
    '../public/webextension-test-app/webextension.zip',
  );

  rimraf.sync(path.resolve(__dirname, '../out/webextension'));
  rimraf.sync(zip);

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

  const result = execSync(`zip -r ${zip} ./webextension/`, {
    cwd: path.resolve(__dirname, '../out/'),
  });
  console.log(result.toString());
})();
