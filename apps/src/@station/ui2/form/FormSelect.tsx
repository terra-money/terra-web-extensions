import {
  Select as MantineSelect,
  SelectProps as MantineSelectProps,
  SelectStylesNames,
} from '@mantine/core';
import React from 'react';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';

export interface FormSelectProps extends MantineSelectProps {
  width?: number;
}

export function FormSelect(selectProps: FormSelectProps) {
  const { classes } = useFormSelectStyles(selectProps);
  return (
    <MantineSelect {...selectProps} variant="unstyled" classNames={classes} />
  );
}

export const useFormSelectStyles = createMantineStyles<
  SelectStylesNames,
  FormSelectProps
>((_, { width = 90 }) => ({
  root: {
    svg: {
      color: 'var(--text-color) !important',
    },
  },
  input: {
    color: 'var(--text-color)',
    fontWeight: 500,
    width,
    paddingLeft: 12,
  },
  dropdown: {
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
}));
