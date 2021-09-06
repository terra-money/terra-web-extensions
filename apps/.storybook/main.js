const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: {
    reactDocgen: 'react-docgen',
  },
  addons: [
    {
      name: '@storybook/addon-storysource',
      options: {
        loaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/preset-create-react-app',
      options: {
        scriptsPackageName: path.dirname(require.resolve('react-scripts/package.json')),
      },
    },
  ],
  //webpackFinal: async (config, { configType }) => {
  //  config.resolve.alias = {
  //    ...config.resolve.alias,
  //    ...alias,
  //  };
  //
  //  return config;
  //},
};
