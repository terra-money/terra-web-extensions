import { updateWallet } from '@terra-dev/web-extension-backend';
import { useWallet } from '@terra-money/use-wallet';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import { CanNotFindWallet } from 'frame/components/views/CanNotFindWallet';
import { InProgress } from 'frame/components/views/InProgress';
import {
  UpdateWallet,
  UpdateWalletResult,
} from 'frame/components/views/UpdateWallet';
import { FindWalletStatus, useFindWallet } from 'frame/queries/useFindWallet';

export function WalletUpdate({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const { network } = useWallet();

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
      <SubLayout title="Edit wallet" onBack={cancel}>
        <InProgress title="Searching for wallet" />
      </SubLayout>
    );
  }

  return (
    <SubLayout title="Edit wallet" onBack={cancel}>
      <UpdateWallet wallet={wallet} onCancel={cancel} onUpdate={update} />
    </SubLayout>
  );
}
