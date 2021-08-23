import webpackConfig from '@rocket-scripts/react-preset/webpackConfig';
import { readPackageAlias } from '@rocket-scripts/read-package-alias';
import {
  envToDefinePluginDefinitions,
  readEnv,
} from '@rocket-scripts/webpack-fns';
import path from 'path';
import { Configuration, DefinePlugin, ProvidePlugin } from 'webpack';
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

export const polyfills: Configuration = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};

export const envs: Configuration = {
  plugins: [new DefinePlugin(envToDefinePluginDefinitions(env))],
};

export const webpackConfigs = merge(alias, loaders, polyfills, envs);
