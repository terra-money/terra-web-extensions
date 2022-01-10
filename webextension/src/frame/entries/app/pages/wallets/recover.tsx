import { DonutIcon } from '@station/ui';
import {
  addWallet,
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import { NewWallet, NewWalletResult } from 'frame/components/views/NewWallet';
import { RecoverWallet } from 'frame/components/views/RecoverWallet';
import { SelectAvailableBIPWallet } from 'frame/components/views/SelectAvailableBIPWallet';
import { useStore } from 'frame/contexts/store';
import { BIPWalletInfo } from 'frame/models/BIPWalletInfo';

export function WalletsRecover({ history }: RouteComponentProps) {
  const { wallets } = useStore();

  const [newWallet, setNewWallet] = useState<NewWalletResult | null>(null);

  const [availableBipWallets, setAvailableBipWallets] = useState<
    BIPWalletInfo[] | null
  >(null);

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

  const createBipWallets = useCallback(
    async (bipWallets: BIPWalletInfo[]) => {
      if (bipWallets.length === 1) {
        await confirm(bipWallets[0].mk);
      } else if (bipWallets.length > 1) {
        setAvailableBipWallets(bipWallets);
      }
    },
    [confirm],
  );

  if (!newWallet) {
    return (
      <SubLayout
        title="Recover existing wallet"
        onBack={cancel}
        rightSection={<DonutIcon ratio={0} />}
      >
        <NewWallet wallets={wallets} onConfirm={create} />
      </SubLayout>
    );
  }

  if (Array.isArray(availableBipWallets)) {
    return (
      <SubLayout
        title="Select address to recover"
        onBack={cancel}
        rightSection={<DonutIcon ratio={1} />}
      >
        <SelectAvailableBIPWallet
          wallets={wallets}
          availableBipWallets={availableBipWallets}
          onSelect={confirm}
        />
      </SubLayout>
    );
  }

  return (
    <SubLayout
      title="Enter your seed phrase"
      onBack={cancel}
      rightSection={<DonutIcon ratio={0.5} />}
    >
      <RecoverWallet wallets={wallets} onConfirm={createBipWallets} />
    </SubLayout>
  );
}
