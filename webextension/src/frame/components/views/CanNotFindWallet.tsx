import { FinderAddressLink } from '@libs/ui';
import { Button } from '@station/ui';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface CanNotFindWalletProps {
  className?: string;
  chainID: string;
  terraAddress: string;
  onConfirm: () => void;
}

export function CanNotFindWallet({
  className,
  chainID,
  terraAddress,
  onConfirm,
}: CanNotFindWalletProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMoodBad />}
      title="Can't find Wallet"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Continue
        </Button>
      }
    >
      <p>
        Can't find the wallet of{' '}
        <FinderAddressLink
          chainID={chainID}
          address={terraAddress}
          shortenAddress
        />
      </p>
    </ViewCenterLayout>
  );
}
