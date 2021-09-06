import {
  addWallet,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  CreateWallet,
  CreateWalletResult,
} from 'webextension/components/views/CreateWallet';
import { CreateWalletValidate } from 'webextension/components/views/CreateWalletValidate';

export function WalletsCreate({ history }: RouteComponentProps) {
  const [result, setResult] = useState<CreateWalletResult | null>(null);
  //const [result, setResult] = useState<CreateWalletResult | null>(() => ({
  //  name: 'hello',
  //  mk: createMnemonicKey(),
  //  password: '1234567890',
  //  design: 'red',
  //}));

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(async (next: CreateWalletResult) => {
    setResult(next);
  }, []);

  const validate = useCallback(
    async ({ name, design, password, mk }: CreateWalletResult) => {
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

  if (!result) {
    return (
      <CreateWallet onCancel={cancel} onCreate={create}>
        <header>
          <h1>New Wallet</h1>
        </header>
      </CreateWallet>
    );
  }

  return (
    <CreateWalletValidate
      createWallet={result!}
      onCancel={cancel}
      onValidate={validate}
    >
      <header>
        <h1>Confirm your seed</h1>
      </header>
    </CreateWalletValidate>
  );
}
