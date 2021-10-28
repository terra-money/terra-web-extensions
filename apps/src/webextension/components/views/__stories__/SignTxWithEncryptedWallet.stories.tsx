import { Meta } from '@storybook/react';
import {
  createMnemonicKey,
  createWallet,
  encryptWallet,
} from '@terra-dev/web-extension-backend';
import { MsgExecuteContract, StdFee } from '@terra-money/terra.js';
import React from 'react';
import { SignTxWithEncryptedWallet } from '../SignTxWithEncryptedWallet';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

const mk = createMnemonicKey();

const encryptedWallet = encryptWallet(createWallet(mk), '1234567890');

export const SignTxWithEncryptedWallet_ = () => {
  return (
    <PopupStoryContainer>
      <SignTxWithEncryptedWallet
        wallet={{
          encryptedWallet,
          name: 'test-wallet',
          terraAddress: mk.accAddress,
          design: 'terra',
        }}
        network={{
          name: 'testnet',
          chainID: 'bombay-12',
          lcd: 'https://bombay-lcd.terra.dev',
        }}
        tx={{
          msgs: [
            new MsgExecuteContract(
              'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
              'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
              {
                hello: {
                  foo: 'bar',
                },
              },
            ),
          ],
          fee: new StdFee(100000, '1500000uusd'),
        }}
        hostname="https://app.anchorprotocol.com"
        date={new Date()}
        onDeny={console.log}
        onProceed={console.log}
      />
    </PopupStoryContainer>
  );
};
