import { WATCH_DEV_CONFIG } from '@rocket-scripts/webpack-fns';
import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import { createConfig } from './webextension.config';
import { cwd } from './webpackConfigs';

//@ts-ignore
process.env.NODE_ENV = 'development';

const out = path.resolve(cwd, 'dev');

const compiler = webpack(createConfig(out, WATCH_DEV_CONFIG));

(async () => {
  // clean
  rimraf.sync(out);

  // copy static files
  await fs.copy(path.resolve(cwd, 'public'), out);

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
