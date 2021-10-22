import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export interface BoxProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

function Component(divProps: BoxProps) {
  return <div {...divProps} />;
}

export const boxStyle = css`
  background-color: var(--color-box-background);
  border: 1px solid var(--color-box-border);
  color: var(--color-box-text);

  border-radius: 8px;
`;

const StyledComponent = styled(Component)`
  ${boxStyle};

  padding: 20px;

  font-size: 14px;
`;

export const Box = fixHMR(StyledComponent);
