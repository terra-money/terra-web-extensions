import { Button, Message } from '@station/ui2';
import React from 'react';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';

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
    <div className={className}>
      <FormMain>
        <Message variant="warning">
          {terraAddress} 지갑을 찾을 수 없습니다.
        </Message>
      </FormMain>

      <FormFooter>
        <Button variant="primary" size="large" onClick={onConfirm}>
          Confirm
        </Button>
      </FormFooter>
    </div>
  );
}
