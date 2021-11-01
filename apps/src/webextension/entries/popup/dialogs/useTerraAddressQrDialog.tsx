import { DialogProps, OpenDialog, useDialog } from '@libs/use-dialog';
import { Modal } from '@station/ui';
import QRCode from 'qrcode.react';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';

interface FormParams {
  className?: string;
  terraAddress: string;
}

type FormReturn = void;

export function useTerraAddressQrDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  className,
  terraAddress,
  closeDialog,
}: DialogProps<FormParams, FormReturn>) {
  return (
    <Modal onClose={() => closeDialog()}>
      <DialogLayout
        title="Your wallet address"
        onClose={() => closeDialog()}
        className={className}
      >
        <main>
          <QRCode
            value={terraAddress}
            size={280}
            fgColor="#2043b5"
            style={{
              border: '1px solid var(--desaturated-400)',
              padding: 20,
              borderRadius: 8,
            }}
          />
          <p>{terraAddress}</p>
        </main>
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
    gap: 20px;
    align-items: center;

    color: var(--color-dialog-color);
  }
`;
