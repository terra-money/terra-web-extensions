import { createEntry } from '@rocket-scripts/webpack-fns';
import path from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { cwd, env, webpackConfigs } from '../scripts/webpackConfigs';

export function createConfig(
  out: string,
  config: Configuration,
  optimization: boolean = false,
): Configuration[] {
  const app = path.resolve(cwd, 'src/webextension');
  const analyzer = (name: string) => {
    return config.mode === 'production'
      ? {
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: path.resolve(
            out,
            `../webextension--${name}.report.html`,
          ),
        }
      : undefined;
  };

  const baseConfig = merge(config, webpackConfigs, {
    devtool: 'inline-source-map',
  });

  return [
    // background
    merge(
      baseConfig,
      createEntry({
        outDir: out,
        env,
        optimization: optimization ? 'minify' : false,
        filename: `[name].js`,
        analyzerOptions: analyzer('background.report.html'),
        entry: [
          {
            name: 'background',
            script: path.resolve(app, 'entries/background/index.ts'),
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
        optimization: optimization ? 'minify' : false,
        filename: `[name].js`,
        analyzerOptions: analyzer('content.report.html'),
        entry: [
          {
            name: 'content',
            script: path.resolve(app, 'entries/content/index.ts'),
          },
        ],
      }),
    ),
    // inpage
    merge(
      baseConfig,
      createEntry({
        outDir: out,
        env,
        optimization: optimization ? 'minify' : false,
        filename: `[name].js`,
        analyzerOptions: analyzer('inpage.report.html'),
        entry: [
          {
            name: 'inpage',
            script: path.resolve(app, 'entries/inpage/index.ts'),
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
        optimization: optimization ? 'minify' : false,
        filename: `[name].js`,
        analyzerOptions: analyzer('app.report.html'),
        entry: [
          {
            name: 'app',
            script: path.resolve(app, 'entries/app/index.tsx'),
            html: path.resolve(app, 'entries/app/index.html'),
          },
        ],
      }),
    ),
  ];
}
