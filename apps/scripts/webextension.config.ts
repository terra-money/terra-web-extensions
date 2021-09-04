import { createEntry } from '@rocket-scripts/webpack-fns';
import path from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { cwd, env, webpackConfigs } from '../scripts/webpackConfigs';

export function createConfig(
  out: string,
  config: Configuration,
): Configuration[] {
  const app = path.resolve(cwd, 'src/webextension');

  const baseConfig = merge(config, webpackConfigs);

  return [
    // background
    merge(
      baseConfig,
      createEntry({
        outDir: out,
        env,
        entry: [
          {
            name: 'background',
            script: path.resolve(app, 'pages/background/index.ts'),
          },
        ],
      }),
    ),
    // content
    merge(
      baseConfig,
      createEntry({
        outDir: out,
        env,
        entry: [
          {
            name: 'content',
            script: path.resolve(app, 'pages/content/index.ts'),
          },
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
            name: 'index',
            script: path.resolve(app, 'pages/index/index.tsx'),
            html: path.resolve(app, 'pages/index/index.html'),
          },
          {
            name: 'connect',
            script: path.resolve(app, 'pages/connect/index.tsx'),
            html: path.resolve(app, 'pages/connect/index.html'),
          },
          {
            name: 'popup',
            script: path.resolve(app, 'pages/popup/index.tsx'),
            html: path.resolve(app, 'pages/popup/index.html'),
          },
          {
            name: 'tx',
            script: path.resolve(app, 'pages/tx/index.tsx'),
            html: path.resolve(app, 'pages/tx/index.html'),
          },
          {
            name: 'connect-ledger',
            script: path.resolve(app, 'pages/connect-ledger/index.tsx'),
            html: path.resolve(app, 'pages/connect-ledger/index.html'),
          },
          {
            name: 'add-cw20-token',
            script: path.resolve(app, 'pages/add-cw20-token/index.tsx'),
            html: path.resolve(app, 'pages/add-cw20-token/index.html'),
          },
        ],
      }),
    ),
  ];
}
