import { updateWallet } from '@terra-dev/web-extension-backend';
import { useWallet } from '@terra-money/use-wallet';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import { CanNotFindWallet } from 'frame/components/views/CanNotFindWallet';
import { InProgress } from 'frame/components/views/InProgress';
import {
  UpdateWalletPassword,
  UpdateWalletPasswordResult,
} from 'frame/components/views/UpdateWalletPassword';
import { WalletIsNotEncryptedWallet } from 'frame/components/views/WalletIsNotEncryptedWallet';
import { FindWalletStatus, useFindWallet } from 'frame/queries/useFindWallet';

export function WalletChangePassword({
  match,
  history,
}: RouteComponentProps<{ terraAddress: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const { network } = useWallet();

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
        <CanNotFindWallet
          chainID={network.chainID}
          terraAddress={match.params.terraAddress}
          onConfirm={cancel}
        />
      </SubLayout>
    );
  }

  if (wallet === FindWalletStatus.IN_PROGRESS) {
    return (
      <SubLayout title="Change password" onBack={cancel}>
        <InProgress title="Searching for wallet" />
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
