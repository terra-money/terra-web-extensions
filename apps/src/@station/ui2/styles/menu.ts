import { MenuStylesNames } from '@mantine/core';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';

export const useMenuStyles = createMantineStyles<MenuStylesNames>({
  body: {
    width: 170,
    padding: '8px 0',
    backgroundColor: 'var(--color-menu-background)',
    border: 'none',
  },
  item: {
    'fontSize': 12,
    'borderRadius': 0,
    'color': 'var(--color-menu-text)',

    '&[aria-selected="true"]': {
      fontWeight: 500,
      backgroundColor: 'var(--color-menu-background-selected)',
    },

    '&[aria-selected="false"]': {
      opacity: 0.5,
    },
  },
  itemIcon: {
    fontSize: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--color-menu-text)',
  },
});
