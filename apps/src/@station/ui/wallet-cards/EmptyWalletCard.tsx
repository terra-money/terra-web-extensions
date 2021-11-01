import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface EmptyWalletCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

function Component(props: EmptyWalletCardProps) {
  return <div {...props} />;
}

export const StyledComponent = styled(Component)`
  display: grid;
  place-content: center;

  border-radius: 16px;

  border: 1px dashed var(--color-header-text);
  color: var(--color-header-text);

  font-size: 13px;
  font-weight: 500;
`;

export const EmptyWalletCard = fixHMR(StyledComponent);
