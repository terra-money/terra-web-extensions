import { MICRO } from '@anchor-protocol/notation';
import { Button, createMuiTheme, TextField } from '@material-ui/core';
import {
  Money,
  MyLocationOutlined,
  Schedule,
  WifiTethering,
} from '@material-ui/icons';
import { FormSection } from '@terra-dev/station-ui/components/FormSection';
import { LinedList } from '@terra-dev/station-ui/components/LinedList';
import { decryptWallet, EncryptedWallet, Wallet } from '@terra-dev/wallet';
import { WalletCard } from '@terra-dev/wallet-card';
import {
  deserializeTx,
  executeTx,
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionTxFail,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension';
import {
  approveHostnames,
  findWallet,
  readWalletStorage,
} from '@terra-dev/web-extension/backend';
import { StdFee } from '@terra-money/terra.js';
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
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TxDetail } from './components/tx/TxDetail';
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
    const hostname = params.get('hostname');
    const timestamp = params.get('timestamp');

    if (
      !id ||
      !terraAddress ||
      !txBase64 ||
      !networkBase64 ||
      !hostname ||
      !timestamp
    ) {
      throw new Error(`Can't find Transaction!`);
    }

    const serializedTx: SerializedCreateTxOptions = JSON.parse(atob(txBase64));
    const network: WebExtensionNetworkInfo = JSON.parse(atob(networkBase64));

    return {
      id,
      terraAddress,
      network,
      serializedTx,
      hostname,
      timestamp: new Date(parseInt(timestamp)),
    };
  }, []);

  const tx = useMemo(() => {
    return deserializeTx(txInfo.serializedTx);
  }, [txInfo.serializedTx]);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [password, setPassword] = useState<string>('');

  // null - in progress checking
  // undefined - there is no wallet
  const [encryptedWallet, setEncryptedWallet] = useState<
    EncryptedWallet | undefined | null
  >(null);

  const [needApproveHostname, setNeedApproveHostname] = useState<boolean>(
    false,
  );

  const [fee] = useState<StdFee | undefined>(() => tx.fee);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed = useCallback(
    async (param: {
      id: string;
      password: string;
      encryptedWallet: EncryptedWallet;
      network: WebExtensionNetworkInfo;
      serializedTx: SerializedCreateTxOptions;
    }) => {
      const wallet: Wallet = decryptWallet(
        param.encryptedWallet.encryptedWallet,
        param.password,
      );

      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + param.id,
      });

      executeTx(wallet, param.network, param.serializedTx).subscribe({
        next: (result) => {
          if (
            result.status === WebExtensionTxStatus.FAIL &&
            'toJSON' in result.error
          ) {
            port.postMessage({
              ...result,
              error: result.error.toJSON(),
            });
          } else {
            port.postMessage(result);
          }
        },
        error: (error) => {
          port.postMessage({
            status: WebExtensionTxStatus.FAIL,
            error,
          } as WebExtensionTxFail);
        },
        complete: () => {
          port.disconnect();
        },
      });
    },
    [],
  );

  const deny = useCallback((param: { id: string }) => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + param.id,
    });

    port.postMessage({
      status: WebExtensionTxStatus.DENIED,
    });

    port.disconnect();
  }, []);

  const approveHostname = useCallback(async () => {
    await approveHostnames(txInfo.hostname);

    setNeedApproveHostname(false);
  }, [txInfo.hostname]);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  // initialize
  useEffect(() => {
    if (!txInfo) return;

    findWallet(txInfo.terraAddress).then((nextEncryptedWallet) =>
      setEncryptedWallet(nextEncryptedWallet),
    );

    readWalletStorage().then(({ approvedHostnames }) => {
      if (
        !approvedHostnames.some(
          (itemHostname) => itemHostname === txInfo.hostname,
        )
      ) {
        setNeedApproveHostname(true);
      }
    });
  }, [txInfo]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (encryptedWallet === null) {
    return null;
  }

  if (!txInfo) {
    return (
      <div className={className}>
        <p>Can't find Tx</p>

        <Button variant="contained" color="secondary" onClick={deny}>
          Deny
        </Button>
      </div>
    );
  }

  if (encryptedWallet === undefined) {
    return (
      <div className={className}>
        <p>Undefined the Wallet "{txInfo.terraAddress}"</p>

        <Button variant="contained" color="secondary" onClick={deny}>
          Deny
        </Button>
      </div>
    );
  }

  if (needApproveHostname) {
    return (
      <FormSection className={className}>
        <header>
          <h1>Approve this site?</h1>
        </header>

        <p>{txInfo.hostname}</p>

        <footer>
          <Button variant="contained" color="secondary" onClick={deny}>
            Deny
          </Button>
          <Button variant="contained" color="primary" onClick={approveHostname}>
            Approve
          </Button>
        </footer>
      </FormSection>
    );
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
          <span>{txInfo.hostname}</span>
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
        <li>
          <div>
            <i>
              <Money />
            </i>
            <span>FEE</span>
          </div>
          <span>
            {fee &&
              fee.amount
                .toArray()
                .map(
                  (coin) =>
                    coin.amount.div(MICRO).toString() +
                    coin.denom.substr(1).toUpperCase(),
                )
                .join(', ')}
          </span>
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
