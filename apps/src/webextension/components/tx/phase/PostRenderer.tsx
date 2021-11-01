import { TxReceipt } from '@libs/app-fns';
import { Button } from '@station/ui';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import { RotateSpinner } from 'react-spinners-kit';
import styled from 'styled-components';
import { TxReceipts } from '../TxReceipts';
import { Layout } from './Layout';

export interface PostRendererProps {
  className?: string;
  receipts: (TxReceipt | undefined | null | false)[];
  onClose?: () => void | undefined;
}

function PostRendererBase({ className, receipts, onClose }: PostRendererProps) {
  return (
    <Layout className={className}>
      <figure>
        <RotateSpinner />
      </figure>

      <h2>Waiting for Terra Station...</h2>

      <TxReceipts receipts={receipts} />

      {onClose && (
        <Button variant="primary" size="large" onClick={onClose}>
          Stop
        </Button>
      )}
    </Layout>
  );
}

export const StyledPostRenderer = styled(PostRendererBase)`
  // TODO
`;

export const PostRenderer = fixHMR(StyledPostRenderer);
