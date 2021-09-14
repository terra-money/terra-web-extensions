import type { DialogProps, OpenDialog } from '@libs/use-dialog';
import { useDialog } from '@libs/use-dialog';
import { updateWallet } from '@terra-dev/web-extension-backend';
import type { ReactNode } from 'react';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { DialogModal } from 'webextension/components/modal/DialogModal';
import { NotFoundWallet } from 'webextension/components/views/NotFoundWallet';
import {
  UpdateWallet,
  UpdateWalletResult,
} from 'webextension/components/views/UpdateWallet';
import {
  FindWalletStatus,
  useFindWallet,
} from 'webextension/queries/useFindWallet';

interface FormParams {
  terraAddress: string;
}

type FormReturn = void;

export function useWalletUpdateDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  closeDialog,
  terraAddress,
}: DialogProps<FormParams, FormReturn>) {
  const wallet = useFindWallet(terraAddress);

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

      closeDialog();
    },
    [closeDialog, wallet],
  );

  if (wallet === FindWalletStatus.NOT_FOUND) {
    return (
      <DialogModal onClose={closeDialog} headerTitle="Update Wallet">
        <NotFoundWallet terraAddress={terraAddress} onConfirm={closeDialog} />
      </DialogModal>
    );
  }

  if (wallet === FindWalletStatus.IN_PROGRESS) {
    return (
      <DialogModal onClose={closeDialog} headerTitle="Update Wallet">
        <div></div>
      </DialogModal>
    );
  }

  return (
    <DialogModal onClose={closeDialog} headerTitle="Update Wallet">
      <UpdateWallet wallet={wallet} onCancel={closeDialog} onUpdate={update} />
    </DialogModal>
  );
}

const Component = styled(ComponentBase)``;
