import { Button } from '@material-ui/core';
import { FormLayout, Layout } from '@station/ui';
import React from 'react';

export interface CanNotFindWalletProps {
  className?: string;
  terraAddress: string;
  onConfirm: () => void;
}

export function CanNotFindWallet({
  className,
  terraAddress,
  onConfirm,
}: CanNotFindWalletProps) {
  return (
    <Layout className={className}>
      <FormLayout>
        <p>{terraAddress} 지갑을 찾을 수 없습니다</p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </footer>
    </Layout>
  );
}
