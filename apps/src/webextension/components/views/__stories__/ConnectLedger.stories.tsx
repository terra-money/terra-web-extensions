import { Meta } from '@storybook/react';
import { WalletLedgerError } from '@terra-dev/wallet-interface';
import React from 'react';
import { ConnectLedger } from '../ConnectLedger';

export default {
  title: 'webextension/views',
} as Meta;

export const ConnectLedger_ = () => {
  return (
    <div>
      <ConnectLedger
        wallets={[
          {
            usbDevice: {} as any,
            name: 'anchor-dev2',
            terraAddress: 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
            design: 'anchor',
          },
        ]}
        onConnect={async (name, design) => {
          throw new WalletLedgerError(27404, `Ledger error!`);
        }}
        onCancel={console.log}
      />
    </div>
  );
};
