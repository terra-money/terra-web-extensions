import { TxReceipt } from '@libs/webapp-fns';
import { Button } from '@material-ui/core';
import { DoneAllRounded } from '@material-ui/icons';
import { fixHMR } from 'fix-hmr';
import React from 'react';
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
        <DoneAllRounded style={{ color: 'var(--color-paleblue)' }} />
      </figure>

      <h2>Complete</h2>

      <TxReceipts receipts={receipts} />

      {onClose && <Button onClick={onClose}>OK</Button>}
    </Layout>
  );
}

export const StyledSucceedRenderer = styled(SucceedRendererBase)`
  // TODO
`;

export const SucceedRenderer = fixHMR(StyledSucceedRenderer);
