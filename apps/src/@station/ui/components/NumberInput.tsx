import { TextFieldProps } from '@material-ui/core';
import { useRestrictedNumberInput } from '@libs/use-restricted-input';
import React, { ChangeEvent, useCallback } from 'react';
import { TextInput } from './TextInput';

export interface NumberInputProps<T extends string>
  extends Omit<
    TextFieldProps,
    'onChange' | 'defaultValue' | 'value' | 'type' | 'ref'
  > {
  value: T;
  pattern?: string;
  onChange: (nextValue: T) => void;
  type?: 'decimal' | 'integer';
  maxDecimalPoints?: number;
  maxIntegerPoints?: number;
}

export function NumberInput<T extends string>({
  type = 'decimal',
  pattern = '[0-9.]*',
  value,
  onChange,
  maxDecimalPoints,
  maxIntegerPoints,
  ...textFieldProps
}: NumberInputProps<T>) {
  const inputOnChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      onChange(target.value as T);
    },
    [onChange],
  );

  const handlers = useRestrictedNumberInput({
    type,
    maxIntegerPoinsts: maxIntegerPoints,
    maxDecimalPoints,
    onChange: inputOnChange,
  });

  return (
    <TextInput
      {...textFieldProps}
      {...handlers}
      type="text"
      value={value}
      inputProps={{ pattern }}
    />
  );
}
