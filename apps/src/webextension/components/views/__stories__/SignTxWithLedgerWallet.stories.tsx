import { Meta } from '@storybook/react';
import { WebConnectorLedgerError } from '@terra-dev/web-connector-interface';
import { MsgExecuteContract, Fee } from '@terra-money/terra.js';
import React from 'react';
import { SignTxWithLedgerWallet } from '../SignTxWithLedgerWallet';

export default {
  title: 'webextension/views',
} as Meta;

export const SignTxWithLedgerWallet_ = () => {
  return (
    <div>
      <SignTxWithLedgerWallet
        wallet={{
          usbDevice: {} as any,
          name: 'Test ledger',
          terraAddress: 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
          design: 'anchor',
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
          fee: new Fee(100000, '1500000uusd'),
        }}
        hostname="https://app.anchorprotocol.com"
        date={new Date()}
        onDeny={console.log}
        onProceed={console.log}
        createLedgerKey={() => {
          throw new WebConnectorLedgerError(
            27404,
            'Ledger 를 찾을 수 없습니다.',
          );
        }}
      />
    </div>
  );
};
