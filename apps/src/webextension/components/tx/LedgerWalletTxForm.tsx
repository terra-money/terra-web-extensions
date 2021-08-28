import { LedgerWallet, TxRequest } from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface LedgerWalletTxFormProps {
  className?: string;
  txRequest: TxRequest;
  wallet: LedgerWallet;
  onDeny: (params: { id: string }) => void;
}

function LedgerWalletTxFormBase({ className }: LedgerWalletTxFormProps) {
  return <div className={className}>LedgerWalletTxForm</div>;
}

export const StyledLedgerWalletTxForm = styled(LedgerWalletTxFormBase)`
  // TODO
`;

export const LedgerWalletTxForm = fixHMR(StyledLedgerWalletTxForm);
