import { DialogProps, OpenDialog, useDialog } from '@libs/use-dialog';
import { Modal } from '@station/ui2';
import { useWallet } from '@terra-dev/use-wallet';
import {
  addCW20Tokens,
  readCW20Storage,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';
import { ManageCW20Tokens } from 'webextension/components/views/ManageCW20Tokens';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';

interface FormParams {
  className?: string;
}

type FormReturn = void;

export function useManageCW20TokensDialog(): [
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

  const [initialTokens, setInitialTokens] = useState<string[] | null>(null);

  const existsTokens = useCW20Tokens();

  useEffect(() => {
    readCW20Storage().then(({ cw20Tokens }) => {
      setInitialTokens(cw20Tokens[network.chainID] ?? []);
    });
  }, [network.chainID]);

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
        title="Manage tokens"
        onClose={() => closeDialog()}
        className={className}
      >
        {initialTokens && (
          <ManageCW20Tokens
            initialTokens={initialTokens}
            existsTokens={existsTokens}
            onRemove={remove}
            onAdd={add}
            onClose={cancel}
          />
        )}
      </DialogLayout>
    </Modal>
  );
}

const Component = styled(ComponentBase)`
  width: 400px;
  min-height: 450px;
  max-height: 450px;
`;
