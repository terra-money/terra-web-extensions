import { FormLayout, FormSection } from '@libs/station-ui';
import { Button } from '@material-ui/core';
import React from 'react';

export interface WalletIsNotEncryptedWalletProps {
  terraAddress: string;
  onConfirm: () => void;
}

export function WalletIsNotEncryptedWallet({
  terraAddress,
  onConfirm,
}: WalletIsNotEncryptedWalletProps) {
  return (
    <FormSection>
      <FormLayout>
        <p>{terraAddress} 은 비밀번호를 변경할 수 없는 Wallet 입니다.</p>
      </FormLayout>

      <footer>
        <footer>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </footer>
      </footer>
    </FormSection>
  );
}