import { DialogProps, OpenDialog, useDialog } from '@libs/use-dialog';
import { Button, Modal, SvgIcon } from '@station/ui2';
import {
  EncryptedWallet,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import React, { ReactNode } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';

interface FormParams {
  className?: string;
  wallet: EncryptedWallet | LedgerWallet;
}

type FormReturn = boolean;

export function useDeleteWalletDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  className,
  wallet,
  closeDialog,
}: DialogProps<FormParams, FormReturn>) {
  return (
    <Modal onClose={() => closeDialog(false)}>
      <DialogLayout
        title="Delete wallet"
        onClose={() => closeDialog(false)}
        className={className}
      >
        <main>
          <SvgIcon width={60} height={60}>
            <MdDeleteForever />
          </SvgIcon>

          <h1>Delete wallet</h1>

          <p>
            Are you sure you want to delete this wallet? Your wallet cannot be
            recovered without seed phrase.
          </p>
        </main>

        <footer>
          <Button variant="dim" size="large" onClick={() => closeDialog(false)}>
            Cancel
          </Button>

          <Button
            variant="danger"
            size="large"
            onClick={() => closeDialog(true)}
          >
            Delete
          </Button>
        </footer>
      </DialogLayout>
    </Modal>
  );
}

const Component = styled(ComponentBase)`
  width: 400px;
  min-height: 450px;
  max-height: 450px;

  main {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;

    color: var(--color-dialog-color);

    h1 {
      font-size: 24px;
      line-height: 1.5;
    }

    p {
      font-size: 16px;
      line-height: 1.5;
      max-width: 85%;
      text-align: center;
    }
  }

  footer {
    margin-top: 40px;
    width: 100%;

    display: flex;
    gap: 10px;

    button {
      flex: 1;
    }
  }
`;
