import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
  ButtonStylesNames,
} from '@mantine/core';
import React from 'react';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';
import { ButtonVariant } from './Button';

export const useCircleButtonStyles = createMantineStyles<
  ButtonStylesNames,
  { size: number; variant: ButtonVariant }
>((_, { size, variant }) => {
  return {
    root: {
      'padding': 0,
      'fontSize': Math.round(size * 0.58333333),
      'fontWeight': 400,
      'width': size,
      'height': size,
      'minWidth': size,
      'minHeight': size,
      'maxWidth': size,
      'maxHeight': size,
      'borderRadius': '50%',
      'backgroundColor': `var(--color-button-${variant}-background)`,
      'border': `var(--color-button-${variant}-stroke)`,
      'color': `var(--color-button-${variant}-text)`,
      'transition': 'background-color 0.4s ease-out',

      '&:hover': {
        backgroundColor: `var(--color-button-${variant}-background-hover, var(--color-button-${variant}-background))`,
        color: `var(--color-button-${variant}-text-hover, var(--color-button-${variant}-text))`,
      },
    },
  };
});

export type CircleButtonProps<C extends React.ElementType> = {
  size?: number;
  variant?: ButtonVariant;
} & Omit<MantineButtonProps<C>, 'size' | 'variant'>;

export function CircleButton<C extends React.ElementType = 'button'>({
  size = 24,
  variant = 'primary',
  ...props
}: CircleButtonProps<C>) {
  const { classes: buttonStyles } = useCircleButtonStyles({ size, variant });
  return <MantineButton {...props} classNames={buttonStyles} />;
}
