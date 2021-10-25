import { updateWallet } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { InProgress } from 'webextension/components/views/InProgress';
import { NotFoundWallet } from 'webextension/components/views/NotFoundWallet';
import {
  UpdateWallet,
  UpdateWalletResult,
} from 'webextension/components/views/UpdateWallet';
import {
  FindWalletStatus,
  useFindWallet,
} from 'webextension/queries/useFindWallet';

export function WalletUpdate({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const wallet = useFindWallet(match.params.terraAddress);

  const update = useCallback(
    async ({ name, design }: UpdateWalletResult) => {
      if (
        wallet === FindWalletStatus.IN_PROGRESS ||
        wallet === FindWalletStatus.NOT_FOUND
      ) {
        return;
      }

      const nextWallet = { ...wallet, name, design };

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
      <SubLayout title="Edit wallet" onBack={cancel}>
        <InProgress>Searching for wallet</InProgress>
      </SubLayout>
    );
  }

  return (
    <SubLayout title="Edit wallet" onBack={cancel}>
      <UpdateWallet wallet={wallet} onCancel={cancel} onUpdate={update} />
    </SubLayout>
  );
}
