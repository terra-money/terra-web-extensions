import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface WalletExportProps {
  className?: string;
}

function WalletExportBase({ className }: WalletExportProps) {
  return <div className={className}>WalletExport</div>;
}

export const StyledWalletExport = styled(WalletExportBase)`
  // TODO
`;

export const WalletExport = fixHMR(StyledWalletExport);
