const jestPreset = require('@rocket-scripts/react-preset/jestPreset');

module.exports = {
  ...jestPreset,

  // config
  setupFilesAfterEnv: [
    ...jestPreset.setupFilesAfterEnv,
    './jest.setup.js',
  ],
};
