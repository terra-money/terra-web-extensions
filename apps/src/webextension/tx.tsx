import { Button, createMuiTheme, TextField } from '@material-ui/core';
import {
  MyLocationOutlined,
  Schedule,
  WifiTethering,
} from '@material-ui/icons';
import { Network } from '@terra-dev/network';
import { LinedList } from '@terra-dev/station-ui/components/LinedList';
import {
  deserializeTx,
  executeTx,
  SerializedTx,
  TxFail,
  TxStatus,
} from '@terra-dev/tx';
import { decryptWallet, EncryptedWallet, Wallet } from '@terra-dev/wallet';
import { WalletCard } from '@terra-dev/wallet-card';
import { findWallet } from '@terra-dev/webextension-wallet-storage';
import { GlobalStyle } from 'common/components/GlobalStyle';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TxDetail } from './components/TxDetail';
import { LocalesProvider, useIntlProps } from './contexts/locales';
import { ThemeProvider } from './contexts/theme';
import { txPortPrefix } from './env';

export interface AppProps {
  className?: string;
}

function AppBase({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const txInfo = useMemo(() => {
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
      throw new Error(`Can't find Transaction!`);
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
  if (!encryptedWallet) {
    return <div className={className}></div>;
  }

  return (
    <section className={className}>
      <header>
        <WalletCard
          className="wallet-card"
          name={encryptedWallet.name}
          terraAddress={encryptedWallet.terraAddress}
          design={encryptedWallet.design}
        />
      </header>

      <LinedList
        className="wallets-actions"
        iconMarginRight="0.6em"
        firstLetterUpperCase={false}
      >
        <li>
          <div>
            <i>
              <WifiTethering />
            </i>
            <span>NETWORK</span>
          </div>
          <span>
            {txInfo.network.name} ({txInfo.network.chainID})
          </span>
        </li>
        <li>
          <div>
            <i>
              <MyLocationOutlined />
            </i>
            <span>ORIGIN</span>
          </div>
          <span>{txInfo.origin}</span>
        </li>
        <li>
          <div>
            <i>
              <Schedule />
            </i>
            <span>TIMESTAMP</span>
          </div>
          <span>{txInfo.timestamp.toLocaleString()}</span>
        </li>
      </LinedList>

      <TxDetail tx={tx} className="tx" />

      <section className="form">
        <TextField
          variant="outlined"
          type="password"
          size="small"
          fullWidth
          label="WALLET PASSWORD"
          InputLabelProps={{ shrink: true }}
          value={password}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPassword(target.value)
          }
        />
      </section>

      <footer>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => deny({ ...txInfo })}
        >
          Deny
        </Button>

        <Button
          variant="contained"
          color="primary"
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
        </Button>
      </footer>

      <GlobalStyle backgroundColor="#ffffff" />
    </section>
  );
}

const App = styled(AppBase)`
  max-width: 100vw;

  padding: 20px;

  font-size: 13px;

  header {
    display: flex;
    justify-content: center;

    .wallet-card {
      width: 276px;
    }

    margin-bottom: 30px;
  }

  .tx {
    margin: 30px 0;
  }

  .form {
    margin: 30px 0;
  }

  footer {
    display: flex;

    > * {
      flex: 1;

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
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
