import { Menu, MenuProps } from '@mantine/core';
import { SvgButton } from '@station/ui';
import React from 'react';
import { useMenuStyles } from '../styles/menu';
import { ReactComponent as MoreIcon } from './assets/icons/more.svg';

export interface WalletMoreMenusProps
  extends Omit<MenuProps, 'classNames' | 'control'> {}

export function WalletMoreMenus(props: WalletMoreMenusProps) {
  const { classes: menuClasses } = useMenuStyles();

  return (
    <Menu
      control={
        <SvgButton width={24} height={24}>
          <MoreIcon />
        </SvgButton>
      }
      placement="end"
      classNames={menuClasses}
      transition="scale-y"
      {...props}
    />
  );
}
