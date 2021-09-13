import { FormLayout, Layout } from '@station/ui';
import { Button } from '@material-ui/core';
import React from 'react';

export interface NotFoundWalletProps {
  className?: string;
  terraAddress: string;
  onConfirm: () => void;
}

export function NotFoundWallet({
  className,
  terraAddress,
  onConfirm,
}: NotFoundWalletProps) {
  return (
    <Layout className={className}>
      <FormLayout>
        <p>{terraAddress} 지갑을 찾을 수 없습니다.</p>
      </FormLayout>

      <footer>
        <footer>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </footer>
      </footer>
    </Layout>
  );
}
