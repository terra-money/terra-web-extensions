import { FormLayout, Layout } from '@station/ui';
import { Button } from '@material-ui/core';
import QRCode from 'qrcode.react';
import React, { ReactNode } from 'react';

export interface ViewAddressQRProps {
  className?: string;
  terraAddress: string;
  onConfirm: () => void;
  children?: ReactNode;
}

export function ViewAddressQR({
  className,
  terraAddress,
  onConfirm,
  children,
}: ViewAddressQRProps) {
  return (
    <Layout className={className}>
      {children}

      <FormLayout>
        <QRCode value={terraAddress} size={240} />

        <p>{terraAddress}</p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </footer>
    </Layout>
  );
}
