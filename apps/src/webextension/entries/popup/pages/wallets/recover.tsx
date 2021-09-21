import {
  addWallet,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  RecoverWallet,
  RecoverWalletResult,
} from 'webextension/components/views/RecoverWallet';

export function WalletsRecover({ history }: RouteComponentProps) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(
    async ({ name, design, password, mk }: RecoverWalletResult) => {
      const encryptedWallet: EncryptedWallet = {
        name,
        design,
        terraAddress: mk.accAddress,
        encryptedWallet: encryptWallet(createWallet(mk), password),
      };

      await addWallet(encryptedWallet);

      history.push('/');
    },
    [history],
  );

  return (
    <RecoverWallet onCancel={cancel} onCreate={create}>
      <header>
        <h1>Recover Wallet</h1>
      </header>
    </RecoverWallet>
  );
}
