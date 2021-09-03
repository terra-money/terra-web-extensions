import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface LedgerVerifyProps {
  className?: string;
}

function LedgerVerifyBase({ className }: LedgerVerifyProps) {
  return <div className={className}>LedgerVerify</div>;
}

export const StyledLedgerVerify = styled(LedgerVerifyBase)`
  // TODO
`;

export const LedgerVerify = fixHMR(StyledLedgerVerify);
