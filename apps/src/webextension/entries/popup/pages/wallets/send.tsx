import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface WalletSendProps {
  className?: string;
}

function WalletSendBase({ className }: WalletSendProps) {
  return <div className={className}>WalletSend</div>;
}

export const StyledWalletSend = styled(WalletSendBase)`
  // TODO
`;

export const WalletSend = fixHMR(StyledWalletSend);
