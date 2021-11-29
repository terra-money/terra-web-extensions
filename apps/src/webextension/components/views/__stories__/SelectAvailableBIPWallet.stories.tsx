import { EMPTY_NATIVE_BALANCES } from '@libs/app-fns';
import { KRT, Luna, u, UST } from '@libs/types';
import { Meta } from '@storybook/react';
import {
  BIPCoinType,
  EncryptedWalletString,
} from '@terra-dev/web-extension-backend';
import React from 'react';
import { SelectAvailableBIPWallet } from 'webextension/components/views/SelectAvailableBIPWallet';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

const TEST_BIP_DATA = [
  {
    coinType: BIPCoinType.ATOM,
    mk: {
      accAddress: 'terra1mq847g97yxcwud6trwkppy5kpv7uspce87a978',
    } as any,
    balances: {
      ...EMPTY_NATIVE_BALANCES,
      uUST: '10000000' as u<UST>,
      uKRT: '150000000' as u<KRT>,
      uLuna: '1400343433' as u<Luna>,
    },
  },
  {
    coinType: BIPCoinType.LUNA,
    mk: {
      accAddress: 'terra1mq847g97yxcwud6trwkppy5kpv7uspce87a978',
    } as any,
    balances: {
      ...EMPTY_NATIVE_BALANCES,
    },
  },
];

export const SelectAvailableBIPWallet_ = () => {
  return (
    <PopupStoryContainer>
      <SelectAvailableBIPWallet
        wallets={[
          {
            name: 'anchor-dev2',
            terraAddress: '',
            design: '',
            encryptedWallet: '' as EncryptedWalletString,
          },
          {
            name: 'anchor-dev3',
            terraAddress: '',
            design: '',
            encryptedWallet: '' as EncryptedWalletString,
          },
        ]}
        availableBipWallets={TEST_BIP_DATA}
        onSelect={console.log}
      />
    </PopupStoryContainer>
  );
};
