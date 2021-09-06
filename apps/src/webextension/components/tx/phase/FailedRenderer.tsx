import { TxErrorRendering, TxReceipt } from '@libs/webapp-fns';
import { Button } from '@material-ui/core';
import { ErrorOutlineRounded } from '@material-ui/icons';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  UserDenied,
} from '@terra-dev/wallet-types';
import { fixHMR } from 'fix-hmr';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { TxReceipts } from '../TxReceipts';
import { Layout } from './Layout';

export interface FailedRendererProps {
  className?: string;
  failedReason: TxErrorRendering;
  receipts: (TxReceipt | undefined | null | false)[];
  onClose?: () => void | undefined;
}

function FailedRendererBase({
  className,
  failedReason,
  receipts,
  onClose,
}: FailedRendererProps) {
  return (
    <Layout className={className}>
      <figure>
        <ErrorOutlineRounded />
      </figure>

      {renderTxFailedReason(failedReason)}

      <TxReceipts receipts={receipts} />

      {onClose && (
        <Button variant="contained" color="primary" onClick={onClose}>
          OK
        </Button>
      )}
    </Layout>
  );
}

export const StyledFailedRenderer = styled(FailedRendererBase)`
  // TODO
`;

export const FailedRenderer = fixHMR(StyledFailedRenderer);

function instanceofWithName<E>(error: unknown, name: string): error is E {
  return error instanceof Error && error.name === name;
}

function renderTxFailedReason({ error, errorId }: TxErrorRendering): ReactNode {
  if (
    error instanceof UserDenied ||
    instanceofWithName<UserDenied>(error, 'UserDenied')
  ) {
    return <h2>User Denied</h2>;
  } else if (
    error instanceof CreateTxFailed ||
    instanceofWithName<CreateTxFailed>(error, 'CreateTxFailed')
  ) {
    return (
      <>
        <h2>Failed to broadcast transaction</h2>
        <div>{error.message}</div>
      </>
    );
  } else if (
    error instanceof TxFailed ||
    instanceofWithName<TxFailed>(error, 'TxFailed')
  ) {
    return (
      <>
        <h2>Transaction failed</h2>
        <div>{error.message}</div>
      </>
    );
  } else if (
    error instanceof Timeout ||
    instanceofWithName<Timeout>(error, 'Timeout')
  ) {
    return (
      <>
        <h2>Timeout</h2>
        <div>{error.message}</div>
      </>
    );
  } else if (
    error instanceof TxUnspecifiedError ||
    instanceofWithName<TxUnspecifiedError>(error, 'TxUnspecifiedError')
  ) {
    return (
      <>
        <h2>Transaction failed</h2>
        <div>{error.message}</div>
      </>
    );
  } else {
    return (
      <>
        <h2>Oops, something went wrong!</h2>
        <div>{error instanceof Error ? error.message : String(error)}</div>
      </>
    );
  }
}
