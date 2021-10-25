import { Step } from '@station/ui2';
import {
  addWallet,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { ConfirmYourSeed } from 'webextension/components/views/ConfirmYourSeed';
import {
  NewWallet,
  NewWalletResult,
} from 'webextension/components/views/NewWallet';
import { WriteDownYourSeed } from 'webextension/components/views/WriteDownYourSeed';

export function WalletsCreate({ history }: RouteComponentProps) {
  const [newWallet, setNewWallet] = useState<NewWalletResult | null>(null);
  const [writeDownSeeds, setWriteDownSeeds] = useState<boolean>(false);

  //// dummy data
  //const [newWallet, setNewWallet] = useState<NewWalletResult | null>(() => ({
  //  name: 'hello',
  //  mk: createMnemonicKey(),
  //  password: '1234567890',
  //  design: 'anchor',
  //}));
  //const [writeDownSeeds, setWriteDownSeeds] = useState<boolean>(true);

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(async (next: NewWalletResult) => {
    setNewWallet(next);
  }, []);

  const validate = useCallback(
    async ({ name, design, password, mk }: NewWalletResult) => {
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

  if (!newWallet) {
    return (
      <SubLayout
        title="New wallet"
        onBack={cancel}
        rightSection={<Step steps={['1', '2', '3']} selectedIndex={0} />}
      >
        <NewWallet onConfirm={create} />
      </SubLayout>
    );
  }

  if (!writeDownSeeds) {
    return (
      <SubLayout title="Write down your seed" onBack={cancel}>
        <WriteDownYourSeed
          mk={newWallet.mk}
          onConfirm={() => setWriteDownSeeds(true)}
        />
      </SubLayout>
    );
  }

  return (
    <SubLayout title="Write down your seed" onBack={cancel}>
      <ConfirmYourSeed
        createWallet={newWallet!}
        onCancel={cancel}
        onValidate={validate}
      />
    </SubLayout>
  );
}
