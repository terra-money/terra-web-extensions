import { Network } from '@terra-dev/network';
import { deserializeTx, SerializedTx } from '@terra-dev/tx';
import { decryptWallet, EncryptedWallet, Wallet } from '@terra-dev/wallet';
import { findWallet } from '@terra-dev/webextension-wallet-storage';
import { LCDClient, RawKey } from '@terra-money/terra.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

function MainBase({ className }: { className?: string }) {
  const txInfo = useMemo(() => {
    try {
      const queries = window.location.search;

      const params = new URLSearchParams(queries);

      const terraAddress = params.get('terraAddress');
      const txBase64 = params.get('tx');
      const networkBase64 = params.get('network');

      if (!terraAddress || !txBase64 || !networkBase64) {
        return undefined;
      }

      const tx: SerializedTx = JSON.parse(atob(txBase64));
      const network: Network = JSON.parse(atob(networkBase64));

      return {
        terraAddress,
        network,
        tx,
      };
    } catch {
      return undefined;
    }
  }, []);

  const [password, setPassword] = useState<string>('');

  const [encryptedWallet, setEncryptedWallet] = useState<
    EncryptedWallet | undefined
  >(undefined);

  useEffect(() => {
    if (!txInfo) return;

    findWallet(txInfo.terraAddress).then((encryptedWallet) =>
      setEncryptedWallet(encryptedWallet),
    );
  }, [txInfo]);

  const submit = useCallback(
    async (
      password: string,
      encryptedWallet: EncryptedWallet,
      network: Network,
      tx: SerializedTx,
    ) => {
      const lcd = new LCDClient({
        chainID: network.chainID,
        URL: network.servers.lcd,
        gasPrices: tx.gasPrices,
        gasAdjustment: tx.gasAdjustment,
      });

      const wallet: Wallet = decryptWallet(
        encryptedWallet.encryptedWallet,
        password,
      );

      const { privateKey } = wallet;

      const key = new RawKey(Buffer.from(privateKey, 'hex'));

      const signed = await lcd.wallet(key).createAndSignTx(deserializeTx(tx));

      const data = await lcd.tx.broadcastSync(signed);

      console.log('tx.tsx..()', data);
    },
    [],
  );

  if (!txInfo) {
    return <div className={className}>Can't find Transaction!</div>;
  }

  if (!encryptedWallet) {
    return <div className={className}>Getting wallet...</div>;
  }

  return (
    <div className={className}>
      <h3>{txInfo.terraAddress}</h3>
      <pre>{JSON.stringify(txInfo.tx, null, 2)}</pre>

      <input
        type="text"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />

      <button
        onClick={() =>
          submit(password, encryptedWallet, txInfo.network, txInfo.tx)
        }
      >
        Submit!
      </button>
    </div>
  );
}

const Main = styled(MainBase)`
  max-width: 100vw;

  pre {
    word-break: break-all;
    white-space: break-spaces;
  }
`;

render(<Main />, document.querySelector('#app'));
