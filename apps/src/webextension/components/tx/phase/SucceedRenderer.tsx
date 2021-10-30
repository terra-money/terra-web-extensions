import { TxReceipt } from '@libs/app-fns';
import { Button } from '@station/ui2';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import { MdDoneAll } from 'react-icons/md';
import styled from 'styled-components';
import { TxReceipts } from '../TxReceipts';
import { Layout } from './Layout';

export interface SucceedRendererProps {
  className?: string;
  receipts: (TxReceipt | undefined | null | false)[];
  onClose?: () => void | undefined;
}

function SucceedRendererBase({
  className,
  receipts,
  onClose,
}: SucceedRendererProps) {
  return (
    <Layout className={className}>
      <figure>
        <MdDoneAll />
      </figure>

      <h2>Complete</h2>

      <TxReceipts receipts={receipts} />

      {onClose && (
        <Button variant="primary" size="large" onClick={onClose}>
          OK
        </Button>
      )}
    </Layout>
  );
}

export const StyledSucceedRenderer = styled(SucceedRendererBase)`
  // TODO
`;

export const SucceedRenderer = fixHMR(StyledSucceedRenderer);
