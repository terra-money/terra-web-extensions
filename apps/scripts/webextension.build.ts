import { BUILD_CONFIG } from '@rocket-scripts/webpack-fns';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import { createConfig } from './webextension.config';
import { cwd } from './webpackConfigs';

process.env.NODE_ENV = 'production';

const out = path.resolve(cwd, 'out/webextension');

const compiler = webpack(createConfig(out, BUILD_CONFIG, true));

const zip = path.resolve(__dirname, '../out/webextension.zip');

(async () => {
  // clean
  rimraf.sync(out);
  rimraf.sync(zip);

  // copy static files
  await fs.copy(path.resolve(cwd, 'public/common'), out);
  await fs.copy(path.resolve(cwd, 'public/webextension'), out);

  // start webpack
  compiler.run((err, stats) => {
    if (err) {
      throw err;
    } else if (stats) {
      console.log(
        stats.toString({
          colors: true,
        }),
      );

      const result = execSync(`zip -r ${zip} ./webextension/`, {
        cwd: path.resolve(__dirname, '../out/'),
      });

      console.log(result.toString());
    }
  });
})();
