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
          { name: 'background', script: path.resolve(app, 'background.ts') },
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
            script: path.resolve(app, 'content.ts'),
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
            name: 'connect',
            script: path.resolve(app, 'connect.tsx'),
            html: path.resolve(app, 'connect.html'),
          },
          {
            name: 'popup',
            script: path.resolve(app, 'popup.tsx'),
            html: path.resolve(app, 'popup.html'),
          },
          {
            name: 'tx',
            script: path.resolve(app, 'tx.tsx'),
            html: path.resolve(app, 'tx.html'),
          },
        ],
      }),
    ),
  ];
}
