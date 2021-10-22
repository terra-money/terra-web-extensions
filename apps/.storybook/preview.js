import { MantineProvider } from '@mantine/core';

export const parameters = {
  backgrounds: {
    default: 'content',
    values: [
      { name: 'content', value: 'var(--color-content-background)' },
      { name: 'box', value: 'var(--color-box-background)' },
      { name: 'header', value: 'var(--color-header-background)' },
    ],
  },
};

export const decorators = [
  (Story, { globals }) => (
    <MantineProvider theme={{fontFamily: 'var(--font-family)'}}>
      <Story />
    </MantineProvider>
  ),
];
