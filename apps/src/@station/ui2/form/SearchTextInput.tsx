import { Input, InputProps, InputStylesNames } from '@mantine/core';
import { createMantineStyles } from '@station/ui2/mantine-utils/createMantineStyles';
import React from 'react';

export const useSearchInputStyles = createMantineStyles<InputStylesNames>({
  input: {
    'backgroundColor': 'var(--color-form-background)',
    'border': '1px solid var(--color-form-border)',
    'color': 'var(--color-form-text)',

    'fontSize': 14,
    'height': 45,
    'borderRadius': 8,

    '&::placeholder': {
      color: 'var(--color-form-text)',
      opacity: 0.5,
    },

    '&:focus': {
      backgroundColor: 'var(--color-form-background-focused)',
      border: '1px solid var(--color-form-border-focused)',
      color: 'var(--color-form-text-focused)',
    },

    '&:disabled': {
      backgroundColor: 'var(--color-form-background-disabled)',
      border: '1px solid var(--color-form-border-disabled)',
      color: 'var(--color-form-text-disabled)',
    },
  },
  rightSection: {
    color: 'var(--color-form-label)',

    marginRight: 10,

    svg: {
      width: 24,
      height: 24,
    },
  },
});

export interface SearchTextInputProps extends InputProps<'input'> {}

export function SearchTextInput({ ...inputProps }: SearchTextInputProps) {
  const { classes } = useSearchInputStyles();
  return <Input {...inputProps} classNames={classes} />;
}
