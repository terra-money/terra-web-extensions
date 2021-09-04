import reactRefresh from '@vitejs/plugin-react-refresh';
import * as path from 'path';
import { defineConfig } from 'vite';
import mdx from 'vite-plugin-mdx';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      //'@terra-money/terra.js': path.resolve(__dirname, '../deps/terrajs/src/index.ts'),
      'styled-components':
        'styled-components/dist/styled-components.browser.esm.js',
      'process': path.resolve(__dirname, 'src/polyfills/process-es6.js'),
      //'react-csv': 'react-csv/lib/index.js',
      'readable-stream': 'vite-compatible-readable-stream/readable-browser.js',
    },
  },
  //define: {
  //  'process.env': {},
  //},
  publicDir: path.join(__dirname, 'public/webextension-test-app'),
  server: {
    https: {
      cert: process.env.LOCALHOST_HTTPS_CERT,
      key: process.env.LOCALHOST_HTTPS_KEY,
      //@ts-ignore
      maxSessionMemory: 100,
      peerMaxConcurrentStreams: 300,
    },
    fs: {
      strict: false,
    },
  },
  plugins: [reactRefresh(), tsconfigPaths(), svgr(), mdx()],
  build: {
    sourcemap: true,
    //  rollupOptions: {
    //    input: {
    //      main: path.resolve(__dirname, 'index.html'),
    //      subpage: path.resolve(__dirname, 'subpage.html'),
    //    },
    //  },
  },
});
