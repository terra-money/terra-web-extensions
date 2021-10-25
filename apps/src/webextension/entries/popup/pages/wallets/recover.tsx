import { Step } from '@station/ui2';
import {
  addWallet,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import {
  NewWallet,
  NewWalletResult,
} from 'webextension/components/views/NewWallet';
import { RecoverWallet } from 'webextension/components/views/RecoverWallet';

export function WalletsRecover({ history }: RouteComponentProps) {
  const [newWallet, setNewWallet] = useState<NewWalletResult | null>(null);

  //// dummy data
  //const [newWallet, setNewWallet] = useState<NewWalletResult | null>(() => ({
  //  name: 'hello',
  //  password: '1234567890',
  //  design: 'anchor',
  //}));

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(async (next: NewWalletResult) => {
    setNewWallet(next);
  }, []);

  const confirm = useCallback(
    async (mk: MnemonicKey) => {
      if (!newWallet) {
        return;
      }

      const encryptedWallet: EncryptedWallet = {
        name: newWallet.name,
        design: newWallet.design,
        terraAddress: mk.accAddress,
        encryptedWallet: encryptWallet(createWallet(mk), newWallet.password),
      };

      await addWallet(encryptedWallet);

      history.push('/');
    },
    [history, newWallet],
  );

  if (!newWallet) {
    return (
      <SubLayout
        title="Recover existing wallet"
        onBack={cancel}
        rightSection={<Step steps={['1', '2']} selectedIndex={0} />}
      >
        <NewWallet onConfirm={create} />
      </SubLayout>
    );
  }

  return (
    <SubLayout
      title="Enter your seed phrase"
      onBack={cancel}
      rightSection={<Step steps={['1', '2']} selectedIndex={1} />}
    >
      <RecoverWallet onConfirm={confirm} />
    </SubLayout>
  );
}
