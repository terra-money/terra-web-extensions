import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

export interface FormLabelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label: ReactNode;
  aside?: ReactNode;
}

function FormLabelBase({
  label,
  aside,
  children,
  ...divProps
}: FormLabelProps) {
  return (
    <div {...divProps}>
      <label>
        <span>{label}</span>
        <span>{aside}</span>
      </label>
      <div>{children}</div>
    </div>
  );
}

export const StyledFormLabel = styled(FormLabelBase)`
  > label {
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: 1em;
    font-weight: 500;
    color: var(--color-white44);

    margin-bottom: 0.857142857142857em;
  }
`;

export const FormLabel = fixHMR(StyledFormLabel);

export const FormLabelAside = styled.span`
  font-size: 12px;

  svg {
    font-size: 1em;
    transform: scale(1.1) translateY(0.1em);
  }
`;
