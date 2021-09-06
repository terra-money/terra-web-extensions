import { TxReceipt } from '@libs/webapp-fns';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import { GuardSpinner } from 'react-spinners-kit';
import styled from 'styled-components';
import { TxReceipts } from '../TxReceipts';
import { Layout } from './Layout';

export interface BroadcastRendererProps {
  className?: string;
  receipts: (TxReceipt | undefined | null | false)[];
}

function BroadcastRendererBase({
  className,
  receipts,
}: BroadcastRendererProps) {
  return (
    <Layout className={className}>
      <figure>
        <GuardSpinner />
      </figure>

      <h2>Waiting for receipt...</h2>

      <TxReceipts receipts={receipts} />
    </Layout>
  );
}

export const StyledBroadcastRenderer = styled(BroadcastRendererBase)`
  // TODO
`;

export const BroadcastRenderer = fixHMR(StyledBroadcastRenderer);
