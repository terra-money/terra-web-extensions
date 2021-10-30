import {
  createTransport,
  LedgerKey,
  TERRA_APP_HRP,
  TERRA_APP_PATH,
} from '@terra-dev/web-extension-backend';
import TerraLedgerApp, {
  AppInfoResponse,
  VersionResponse,
} from '@terra-money/ledger-terra-js';
import { LCDClient, MsgSend, Fee, Tx } from '@terra-money/terra.js';
import { CreateTxOptions } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

export interface LedgerVerifyProps {
  className?: string;
}

function LedgerVerifyBase({ className }: LedgerVerifyProps) {
  const [info, setInfo] = useState<AppInfoResponse | null>(null);
  const [version, setVersion] = useState<VersionResponse | null>(null);

  const verify = useCallback(async () => {
    const transport = await createTransport();
    const app = new TerraLedgerApp(transport);

    await app.initialize();

    setInfo(await app.getInfo());
    setVersion(await app.getVersion());

    await transport.close();
  }, []);

  const executeTx = useCallback(async () => {
    console.log('test::start');

    const transport = await createTransport();
    const app = new TerraLedgerApp(transport);

    await app.initialize();
    console.log('test::initialized');

    const publicKey = await app.getAddressAndPubKey(
      TERRA_APP_PATH,
      TERRA_APP_HRP,
    );
    console.log('test::publicKey', publicKey);

    const publicKeyBuffer = Buffer.from(publicKey.compressed_pk as any);
    console.log('test::publicKeyBuffer', publicKeyBuffer);

    const tx: CreateTxOptions = {
      fee: new Fee(1000000, '200000uusd'),
      msgs: [
        new MsgSend(
          publicKey.bech32_address,
          'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
          {
            uusd: 1000000,
          },
        ),
      ],
    };

    const lcd = new LCDClient({
      chainID: 'bombay-12',
      URL: 'https://bombay-lcd.terra.dev',
    });

    const key = new LedgerKey(publicKeyBuffer, app);
    const stdTx: Tx = await lcd.wallet(key).createAndSignTx(tx);

    const result = await lcd.tx.broadcastSync(stdTx);

    console.log('app.tsx..()', result);

    await transport.close();
  }, []);

  return (
    <div className={className}>
      {info && version && (
        <pre>{JSON.stringify({ info, version }, null, 2)}</pre>
      )}
      <button onClick={verify}>Verify</button>
      <button onClick={executeTx}>Execute</button>
    </div>
  );
}

export const StyledLedgerVerify = styled(LedgerVerifyBase)`
  // TODO
`;

export const LedgerVerify = fixHMR(StyledLedgerVerify);
