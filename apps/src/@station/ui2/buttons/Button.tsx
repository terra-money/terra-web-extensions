import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
  ButtonStylesNames,
} from '@mantine/core';
import React from 'react';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';

type ButtonSize = 'large' | 'default' | 'medium' | 'small' | 'tiny';
type ButtonVariant = 'primary' | 'danger' | 'dim' | 'outline';

export const useButtonStyles = createMantineStyles<
  ButtonStylesNames,
  { size: ButtonSize; variant: ButtonVariant }
>((_, { size, variant }) => {
  let height: number;

  let borderRadius: number = 24;
  let fontSize: number = 14;
  let iconMargin: number = 10;
  let iconPadding: number = 20;

  switch (size) {
    case 'large':
      height = 60;
      borderRadius = 30;
      fontSize = 16;
      break;
    case 'default':
      height = 48;
      break;
    case 'medium':
      height = 40;
      break;
    case 'small':
      height = 32;
      break;
    case 'tiny':
      height = 20;
      borderRadius = 10;
      fontSize = 10;
      iconMargin = 3;
      iconPadding = 10;
      break;
  }

  return {
    root: {
      fontSize,
      height,
      borderRadius,
      'backgroundColor': `var(--color-button-${variant}-background)`,
      'border': `var(--color-button-${variant}-stroke)`,
      'color': `var(--color-button-${variant}-text)`,
      'fontWeight': 500,
      'padding': `0 ${iconPadding}px`,
      'transition': 'background-color 0.4s ease-out',

      '&:hover': {
        backgroundColor: `var(--color-button-${variant}-background-hover, var(--color-button-${variant}-background))`,
        color: `var(--color-button-${variant}-text-hover, var(--color-button-${variant}-text))`,
      },

      '&.mantine-button-loading': {
        svg: {
          transform: size === 'tiny' ? 'scale(0.6)' : undefined,
        },
      },
    },

    leftIcon: {
      'marginRight': iconMargin,

      'circle, rect': {
        stroke: 'currentColor',
      },
    },

    rightIcon: {
      'marginLeft': iconMargin,

      'circle, rect': {
        stroke: 'currentColor',
      },
    },
  };
});

export type ButtonProps<C extends React.ElementType> = {
  size?: ButtonSize;
  variant?: ButtonVariant;
} & Omit<MantineButtonProps<C>, 'size' | 'variant'>;

export function Button<C extends React.ElementType = 'button'>({
  size = 'default',
  variant = 'primary',
  ...props
}: ButtonProps<C>) {
  const { classes: buttonStyles } = useButtonStyles({ size, variant });
  return <MantineButton {...props} classNames={buttonStyles} />;
}
