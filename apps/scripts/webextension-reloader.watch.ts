import { createEntry, WATCH_DEV_CONFIG } from '@rocket-scripts/webpack-fns';
import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { cwd, env, webpackConfigs } from './webpackConfigs';

process.env.NODE_ENV = 'development';

const app = path.resolve(cwd, 'src/webextension-reloader');
const out = path.resolve(cwd, 'dev/webextension-reloader');

const baseConfig = merge(WATCH_DEV_CONFIG, webpackConfigs);

const compiler = webpack([
  // background
  merge(
    baseConfig,
    createEntry({
      outDir: out,
      env,
      entry: [
        { name: 'background', script: path.resolve(app, 'background.ts') },
      ],
    }),
  ),
  // html
  merge(
    baseConfig,
    createEntry({
      outDir: out,
      env,
      entry: [
        {
          name: 'options',
          script: path.resolve(app, 'options.tsx'),
          html: path.resolve(app, 'options.html'),
        },
      ],
    }),
  ),
]);

(async () => {
  // clean
  rimraf.sync(out);

  // copy static files
  await fs.copy(path.resolve(cwd, 'public/common'), out);
  await fs.copy(path.resolve(cwd, 'public/webextension-reloader'), out);

  // start webpack
  compiler.watch({}, (err, stats) => {
    if (err) {
      throw err;
    } else if (stats) {
      console.log(
        stats.toString({
          colors: true,
        }),
      );
    }
  });
})();
