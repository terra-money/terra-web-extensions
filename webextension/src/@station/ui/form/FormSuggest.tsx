import { fixHMR } from 'fix-hmr';
import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from 'react';
import styled from 'styled-components';

export interface FormSuggestProps
  extends Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'children'
  > {
  label: ReactNode;
  amount: ReactNode;
}

function Component({
  label,
  amount,
  className,
  ...buttonProps
}: FormSuggestProps) {
  return (
    <span className={className}>
      {label}
      <button {...buttonProps}>{amount}</button>
    </span>
  );
}

const StyledComponent = styled(Component)`
  font-size: 12px;
  font-weight: 500;

  color: var(--color-form-label);

  button {
    border: none;
    outline: none;
    background-color: transparent;

    cursor: pointer;

    font-size: inherit;
    font-weight: inherit;
    color: inherit;

    text-decoration: underline;

    filter: brightness(240%);
  }
`;

export const FormSuggest = fixHMR(StyledComponent);
