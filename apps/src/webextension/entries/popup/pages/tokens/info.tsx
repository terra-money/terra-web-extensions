import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface TokenInfoProps {
  className?: string;
}

function TokenInfoBase({ className }: TokenInfoProps) {
  return <div className={className}>TokenInfo</div>;
}

export const StyledTokenInfo = styled(TokenInfoBase)`
  // TODO
`;

export const TokenInfo = fixHMR(StyledTokenInfo);
