import { TEST_WALLET_ADDRESS } from '@libs/app-fns/test-env';
import { Meta } from '@storybook/react';
import { Msg } from '@terra-money/terra.js';
import React from 'react';
import { MsgsPrint } from 'frame/components/tx/MsgsPrint';

export default {
  title: 'webextension/components',
} as Meta;

export const PrintMsgs_ = () => {
  const data: Msg.Data = {
    '@type': '/terra.wasm.v1beta1.MsgExecuteContract',
    'sender': 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
    'contract': 'terra15dwd5mj8v59wpj0wvt233mf5efdff808c5tkal',
    'execute_msg': {
      deposit_stable: {},
    },
    'coins': [
      {
        denom: 'uusd',
        amount: '100000000',
      },
    ],
  };

  const msg: Msg = Msg.fromData(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MsgsPrint
        msgs={[msg]}
        walletAddress={TEST_WALLET_ADDRESS}
        network={{
          name: 'testnet',
          chainID: 'bombay-12',
          lcd: 'https://bombay-lcd.terra.money',
        }}
      />

      <MsgsPrint
        defaultOpen
        msgs={[msg]}
        walletAddress={TEST_WALLET_ADDRESS}
        network={{
          name: 'testnet',
          chainID: 'bombay-12',
          lcd: 'https://bombay-lcd.terra.money',
        }}
      />
    </div>
  );
};
