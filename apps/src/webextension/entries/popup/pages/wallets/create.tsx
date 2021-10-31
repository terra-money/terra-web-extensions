import { DonutIcon } from '@station/ui2';
import {
  addWallet,
  createMnemonicKey,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { ConfirmYourSeed } from 'webextension/components/views/ConfirmYourSeed';
import {
  NewWallet,
  NewWalletResult,
} from 'webextension/components/views/NewWallet';
import { WriteDownYourSeed } from 'webextension/components/views/WriteDownYourSeed';
import { useStore } from 'webextension/contexts/store';

export function WalletsCreate({ history }: RouteComponentProps) {
  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

  const { wallets } = useStore();

  const [newWallet, setNewWallet] = useState<NewWalletResult | null>(null);
  const [writeDownSeeds, setWriteDownSeeds] = useState<boolean>(false);

  //// dummy data
  //const [newWallet, setNewWallet] = useState<NewWalletResult | null>(() => ({
  //  name: 'hello',
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

  const validate = useCallback(async () => {
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
  }, [history, mk, newWallet]);

  if (!newWallet) {
    return (
      <SubLayout
        title="New wallet"
        onBack={cancel}
        rightSection={<DonutIcon ratio={0} />}
      >
        <NewWallet wallets={wallets} onConfirm={create} />
      </SubLayout>
    );
  }

  if (!writeDownSeeds) {
    return (
      <SubLayout
        title="Write down your seed"
        onBack={cancel}
        rightSection={<DonutIcon ratio={0.5} />}
      >
        <WriteDownYourSeed mk={mk} onConfirm={() => setWriteDownSeeds(true)} />
      </SubLayout>
    );
  }

  return (
    <SubLayout
      title="Write down your seed"
      onBack={cancel}
      rightSection={<DonutIcon ratio={1} />}
    >
      <ConfirmYourSeed mk={mk} onCancel={cancel} onValidate={validate} />
    </SubLayout>
  );
}
