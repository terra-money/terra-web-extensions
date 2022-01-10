import webpackConfig from '@rocket-scripts/react-preset/webpackConfig';
import { readPackageAlias } from '@rocket-scripts/read-package-alias';
import { readEnv } from '@rocket-scripts/webpack-fns';
import path from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

export const cwd = path.resolve(__dirname, '..');
export const env = readEnv();

export const alias: Configuration = {
  resolve: {
    symlinks: false,
    alias: readPackageAlias(cwd),
  },
};

export const loaders: Configuration = webpackConfig({
  cwd,
  chunkPath: '',
  esbuildLoaderOptions: {
    target: 'es2018',
    loader: 'tsx',
    tsconfigRaw: {},
  },
  extractCss: false,
  publicPath: '',
});

export const webpackConfigs = merge(alias, loaders);
