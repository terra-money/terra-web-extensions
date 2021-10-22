import { Menu, MenuProps, MenuStylesNames } from '@mantine/core';
import React from 'react';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';
import { ReactComponent as MoreIcon } from './assets/icons/more.svg';

export interface WalletMoreMenusProps
  extends Omit<MenuProps, 'classNames' | 'control'> {}

export function WalletMoreMenus(props: WalletMoreMenusProps) {
  const { classes: menuClasses } = useMenuStyles();

  return (
    <Menu
      control={<MoreIcon style={{ cursor: 'pointer' }} />}
      placement="end"
      classNames={menuClasses}
      {...props}
    ></Menu>
  );
}

const useMenuStyles = createMantineStyles<MenuStylesNames>({
  body: {
    width: 170,
    padding: '8px 0',
    backgroundColor: 'var(--color-menu-background)',
    border: 'none',
  },
  item: {
    fontSize: 12,
    borderRadius: 0,
    color: 'var(--color-menu-text)',
  },
  itemIcon: {
    fontSize: 15,
  },
});
