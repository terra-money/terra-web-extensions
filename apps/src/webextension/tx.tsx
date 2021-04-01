import { Network } from '@terra-dev/network';
import { executeTx, SerializedTx, TxFail, TxStatus } from '@terra-dev/tx';
import { decryptWallet, EncryptedWallet, Wallet } from '@terra-dev/wallet';
import { findWallet } from '@terra-dev/webextension-wallet-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { txPortPrefix } from 'webextension/env';

function MainBase({ className }: { className?: string }) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const txInfo = useMemo(() => {
    try {
      const queries = window.location.search;

      const params = new URLSearchParams(queries);

      const id = params.get('id');
      const terraAddress = params.get('terraAddress');
      const txBase64 = params.get('tx');
      const networkBase64 = params.get('network');

      if (!id || !terraAddress || !txBase64 || !networkBase64) {
        return undefined;
      }

      const tx: SerializedTx = JSON.parse(atob(txBase64));
      const network: Network = JSON.parse(atob(networkBase64));

      return {
        id,
        terraAddress,
        network,
        tx,
      };
    } catch {
      return undefined;
    }
  }, []);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [password, setPassword] = useState<string>('');

  const [encryptedWallet, setEncryptedWallet] = useState<
    EncryptedWallet | undefined
  >(undefined);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  // initialize
  useEffect(() => {
    if (!txInfo) return;

    findWallet(txInfo.terraAddress).then((encryptedWallet) =>
      setEncryptedWallet(encryptedWallet),
    );
  }, [txInfo]);

  // ---------------------------------------------
  // callback
  // ---------------------------------------------
  const proceed = useCallback(
    async (param: {
      id: string;
      password: string;
      encryptedWallet: EncryptedWallet;
      network: Network;
      tx: SerializedTx;
    }) => {
      const wallet: Wallet = decryptWallet(
        param.encryptedWallet.encryptedWallet,
        param.password,
      );

      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + param.id,
      });

      executeTx(wallet, param.network, param.tx).subscribe(
        (result) => {
          console.log('tx.tsx..()', result);
          port.postMessage(result);
        },
        (error) => {
          port.postMessage({
            status: TxStatus.FAIL,
            error,
          } as TxFail);
        },
        () => {
          port.disconnect();
        },
      );
    },
    [],
  );

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
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
        disabled={password.length === 0}
        onClick={() =>
          proceed({
            ...txInfo,
            password,
            encryptedWallet,
          })
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
