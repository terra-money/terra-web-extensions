import { TxResultRendering, TxStreamPhase } from '@libs/webapp-fns';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import styled from 'styled-components';
import { BroadcastRenderer } from './phase/BroadcastRenderer';
import { FailedRenderer } from './phase/FailedRenderer';
import { PostRenderer } from './phase/PostRenderer';
import { SucceedRenderer } from './phase/SucceedRenderer';

export interface TxRendererProps {
  result: TxResultRendering;
  onClose: () => void;
}

function TxRendererBase({ result, onClose }: TxRendererProps) {
  return (
    <div>
      {result.phase === TxStreamPhase.POST ? (
        <PostRenderer receipts={result.receipts} />
      ) : result.phase === TxStreamPhase.BROADCAST ? (
        <BroadcastRenderer receipts={result.receipts} />
      ) : result.phase === TxStreamPhase.SUCCEED ? (
        <SucceedRenderer receipts={result.receipts} onClose={onClose} />
      ) : result.phase === TxStreamPhase.FAILED ? (
        <FailedRenderer
          failedReason={result.failedReason!}
          receipts={result.receipts}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}

export const StyledTxRenderer = styled(TxRendererBase)`
  width: 580px;
`;

export const TxRenderer = fixHMR(StyledTxRenderer);
