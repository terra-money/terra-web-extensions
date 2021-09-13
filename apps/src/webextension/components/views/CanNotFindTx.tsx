import { Button } from '@material-ui/core';
import { FormLayout, Layout } from '@station/ui';
import React from 'react';

export interface CanNotFindTxProps {
  className?: string;
  onConfirm?: () => void;
}

export function CanNotFindTx({ className, onConfirm }: CanNotFindTxProps) {
  return (
    <Layout className={className}>
      <FormLayout>
        <h2>Error</h2>
        <p>Tx 를 찾을 수 없습니다.</p>
      </FormLayout>

      {onConfirm && (
        <footer>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </footer>
      )}
    </Layout>
  );
}
