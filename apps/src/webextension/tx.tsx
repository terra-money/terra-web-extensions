import { createMuiTheme } from '@material-ui/core';
import { Network } from '@terra-dev/network';
import {
  deserializeTx,
  executeTx,
  SerializedTx,
  TxFail,
  TxStatus,
} from '@terra-dev/tx';
import { decryptWallet, EncryptedWallet, Wallet } from '@terra-dev/wallet';
import { findWallet } from '@terra-dev/webextension-wallet-storage';
import { MsgExecuteContract } from '@terra-money/terra.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from 'webextension/components/ErrorBoundary';
import { GlobalStyle } from 'webextension/components/GlobalStyle';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { ThemeProvider } from 'webextension/contexts/theme';
import { txPortPrefix } from 'webextension/env';

function AppBase({ className }: { className?: string }) {
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
      const origin = params.get('origin');
      const timestamp = params.get('timestamp');

      if (
        !id ||
        !terraAddress ||
        !txBase64 ||
        !networkBase64 ||
        !origin ||
        !timestamp
      ) {
        return undefined;
      }

      const serializedTx: SerializedTx = JSON.parse(atob(txBase64));
      const network: Network = JSON.parse(atob(networkBase64));

      return {
        id,
        terraAddress,
        network,
        serializedTx,
        origin,
        timestamp: new Date(parseInt(timestamp)),
      };
    } catch {
      return undefined;
    }
  }, []);

  const tx = useMemo(() => {
    return txInfo?.serializedTx
      ? deserializeTx(txInfo?.serializedTx)
      : undefined;
  }, [txInfo?.serializedTx]);

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

    findWallet(txInfo.terraAddress).then((nextEncryptedWallet) =>
      setEncryptedWallet(nextEncryptedWallet),
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
      serializedTx: SerializedTx;
    }) => {
      const wallet: Wallet = decryptWallet(
        param.encryptedWallet.encryptedWallet,
        param.password,
      );

      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + param.id,
      });

      executeTx(wallet, param.network, param.serializedTx).subscribe(
        (result) => {
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

  const deny = useCallback((param: { id: string }) => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + param.id,
    });

    port.postMessage({
      status: TxStatus.DENIED,
    });

    port.disconnect();
  }, []);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (!txInfo) {
    return <div className={className}>Can't find Transaction!</div>;
  }

  if (!encryptedWallet) {
    return <div className={className}>지갑이 없음</div>;
  }

  return (
    <div className={className}>
      <h3>Wallet Name</h3>
      <p>{encryptedWallet.name}</p>
      <h3>Wallet Address</h3>
      <p>{txInfo.terraAddress}</p>
      <h3>Network</h3>
      <p>
        {txInfo.network.name} ({txInfo.network.chainID})
      </p>
      <h3>Origin</h3>
      <p>{txInfo.origin}</p>
      <h3>Timestamp</h3>
      <p>{txInfo.timestamp.toLocaleString()}</p>
      <h3>Tx</h3>
      <ul>
        {tx?.msgs.map((msg, i) => (
          <li key={'msg' + i}>
            {msg instanceof MsgExecuteContract && (
              <ul>
                <li>
                  <h4>Sender</h4>
                  <p>{msg.sender}</p>
                </li>
                <li>
                  <h4>Contract</h4>
                  <p>{msg.contract}</p>
                </li>
                <li>
                  <h4>execute_msg</h4>
                  <pre>{JSON.stringify(msg.execute_msg, null, 2)}</pre>
                </li>
                <li>
                  <h4>Coins</h4>
                  <p>{msg.coins.toJSON()}</p>
                </li>
              </ul>
            )}
          </li>
        ))}
      </ul>

      <input
        type="text"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />

      <footer>
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
          Submit
        </button>

        <button onClick={() => deny({ ...txInfo })}>Deny</button>
      </footer>

      <GlobalStyle backgroundColor="#ffffff" />
    </div>
  );
}

const App = styled(AppBase)`
  max-width: 100vw;

  pre {
    word-break: break-all;
    white-space: break-spaces;
  }
`;

const theme: DefaultTheme = createMuiTheme();

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </IntlProvider>
  );
}

render(
  <ErrorBoundary>
    <LocalesProvider>
      <Main />
    </LocalesProvider>
  </ErrorBoundary>,
  document.querySelector('#app'),
);
