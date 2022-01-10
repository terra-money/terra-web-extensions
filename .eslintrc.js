module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier',
  ],
  rules: {
    //  'react-hooks/exhaustive-deps': [
    //    'warn',
    //    {
    //      additionalHooks: '(useCustomHook)',
    //    },
    //  ],
  },
  overrides: [
    {
      files: ['**/*.stories.{js,jsx,ts,tsx}'],
      rules: {
        'import/no-anonymous-default-export': 0,
      },
    },
  ],
};
