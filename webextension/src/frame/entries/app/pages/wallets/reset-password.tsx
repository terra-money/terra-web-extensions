import { DonutIcon } from '@station/ui';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  removeSavedPassword,
  updateWallet,
} from '@terra-dev/web-extension-backend';
import { useWallet } from '@terra-money/use-wallet';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import { CanNotFindWallet } from 'frame/components/views/CanNotFindWallet';
import { InProgress } from 'frame/components/views/InProgress';
import {
  ResetWalletPassword,
  ResetWalletPasswordResult,
} from 'frame/components/views/ResetWalletPassword';
import { WalletIsNotEncryptedWallet } from 'frame/components/views/WalletIsNotEncryptedWallet';
import { FindWalletStatus, useFindWallet } from 'frame/queries/useFindWallet';

export function WalletResetPassword({
  match,
  history,
}: RouteComponentProps<{ terraAddress: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const { network } = useWallet();

  const wallet = useFindWallet(match.params.terraAddress);

  const confirm = useCallback(
    async ({
      encryptedWallet,
      bipWallet,
      password,
    }: ResetWalletPasswordResult) => {
      const nextEncryptedWallet: EncryptedWallet = {
        ...encryptedWallet,
        encryptedWallet: encryptWallet(createWallet(bipWallet.mk), password),
      };

      await updateWallet(encryptedWallet.terraAddress, nextEncryptedWallet);

      await removeSavedPassword(encryptedWallet.terraAddress);

      history.push('/');
    },
    [history],
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
      <SubLayout
        title="Reset wallet password"
        onBack={cancel}
        rightSection={<DonutIcon ratio={0.5} />}
      >
        <ResetWalletPassword
          encryptedWallet={wallet}
          onCancel={cancel}
          onUpdate={confirm}
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
