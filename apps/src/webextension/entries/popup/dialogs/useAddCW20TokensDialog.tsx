import { DialogProps, OpenDialog, useDialog } from '@libs/use-dialog';
import { Modal } from '@station/ui2';
import { useWallet } from '@terra-dev/use-wallet';
import {
  addCW20Tokens,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import React, { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';
import { AddCW20Token } from 'webextension/components/views/AddCW20Token';

interface FormParams {
  className?: string;
}

type FormReturn = void;

export function useAddCW20TokensDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  className,
  closeDialog,
}: DialogProps<FormParams, FormReturn>) {
  const { network } = useWallet();

  const cancel = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const add = useCallback(
    async (tokenAddr: string) => {
      await addCW20Tokens(network.chainID, [tokenAddr]);
    },
    [network.chainID],
  );

  const remove = useCallback(
    async (tokenAddr: string) => {
      await removeCW20Tokens(network.chainID, [tokenAddr]);
    },
    [network.chainID],
  );

  return (
    <Modal onClose={() => closeDialog()}>
      <DialogLayout
        title="Add tokens"
        onClose={() => closeDialog()}
        className={className}
      >
        <AddCW20Token onAdd={add} onRemove={remove} onClose={cancel} />
      </DialogLayout>
    </Modal>
  );
}

const Component = styled(ComponentBase)`
  max-width: 900px;
  min-height: 450px;
  max-height: 450px;

  --token-list-height: 350px;
`;
