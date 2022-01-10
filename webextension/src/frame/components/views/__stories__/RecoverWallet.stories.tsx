import { Meta } from '@storybook/react';
import { EncryptedWalletString } from '@terra-dev/web-extension-backend';
import React from 'react';
import { RecoverWallet } from 'frame/components/views/RecoverWallet';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const RecoverWallet_ = () => {
  return (
    <PopupStoryContainer>
      <RecoverWallet
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
        onConfirm={console.log}
      />
    </PopupStoryContainer>
  );
};
