import { updateWallet } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { InProgress } from 'webextension/components/views/InProgress';
import { NotFoundWallet } from 'webextension/components/views/NotFoundWallet';
import {
  UpdateWalletPassword,
  UpdateWalletPasswordResult,
} from 'webextension/components/views/UpdateWalletPassword';
import { WalletIsNotEncryptedWallet } from 'webextension/components/views/WalletIsNotEncryptedWallet';
import {
  FindWalletStatus,
  useFindWallet,
} from 'webextension/queries/useFindWallet';

export function WalletChangePassword({
  match,
  history,
}: RouteComponentProps<{ terraAddress: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const wallet = useFindWallet(match.params.terraAddress);

  const update = useCallback(
    async ({ encryptedWallet: nextWallet }: UpdateWalletPasswordResult) => {
      if (
        wallet === FindWalletStatus.IN_PROGRESS ||
        wallet === FindWalletStatus.NOT_FOUND
      ) {
        return;
      }

      await updateWallet(wallet.terraAddress, nextWallet);

      history.push('/');
    },
    [history, wallet],
  );

  if (wallet === FindWalletStatus.NOT_FOUND) {
    return (
      <SubLayout title="Not found wallet" onBack={cancel}>
        <NotFoundWallet
          terraAddress={match.params.terraAddress}
          onConfirm={cancel}
        />
      </SubLayout>
    );
  }

  if (wallet === FindWalletStatus.IN_PROGRESS) {
    return (
      <SubLayout title="Change password" onBack={cancel}>
        <InProgress>Searching for wallet</InProgress>
      </SubLayout>
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <SubLayout title="Change password" onBack={cancel}>
        <UpdateWalletPassword
          encryptedWallet={wallet}
          onCancel={cancel}
          onUpdate={update}
        />
      </SubLayout>
    );
  }

  return (
    <WalletIsNotEncryptedWallet
      terraAddress={wallet.terraAddress}
      onConfirm={cancel}
    />
  );
}
