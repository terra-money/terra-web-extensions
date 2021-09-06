import { FormSection } from '@station/ui';
import { Button, createMuiTheme } from '@material-ui/core';
import {
  deserializeTx,
  WebExtensionTxFail,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension';
import {
  approveHostnames,
  EncryptedWallet,
  executeTxWithInternalWallet,
  executeTxWithLedgerWallet,
  findWallet,
  fromURLSearchParams,
  LedgerKey,
  LedgerWallet,
  readHostnamesStorage,
  TxRequest,
  Wallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { SignTxWithEncryptedWallet } from 'webextension/components/views/SignTxWithEncryptedWallet';
import { SignTxWithLedgerWallet } from 'webextension/components/views/SignTxWithLedgerWallet';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from '../../contexts/locales';
import { ThemeProvider } from '../../contexts/theme';
import { txPortPrefix } from '../../env';

export interface AppProps {
  className?: string;
}

function AppBase({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const txRequest = useMemo(() => {
    return fromURLSearchParams(window.location.search);
  }, []);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  // null - in progress checking
  // undefined - there is no wallet
  const [wallet, setWallet] = useState<
    EncryptedWallet | LedgerWallet | undefined | null
  >(null);

  const [needApproveHostname, setNeedApproveHostname] =
    useState<boolean>(false);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
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
    if (!txRequest) {
      return null;
    }

    await approveHostnames(txRequest.hostname);

    setNeedApproveHostname(false);
  }, [txRequest]);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  // initialize
  useEffect(() => {
    if (!txRequest) return;

    findWallet(txRequest.terraAddress).then((nextWallet) =>
      setWallet(nextWallet),
    );

    readHostnamesStorage().then(({ approvedHostnames }) => {
      if (
        !approvedHostnames.some(
          (itemHostname) => itemHostname === txRequest.hostname,
        )
      ) {
        setNeedApproveHostname(true);
      }
    });
  }, [txRequest]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (wallet === null) {
    return null;
  }

  if (!txRequest) {
    return (
      <div className={className}>
        <p>Can't find Tx</p>

        <Button variant="contained" color="secondary" onClick={deny}>
          Deny
        </Button>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={className}>
        <p>Undefined the Wallet "{txRequest.terraAddress}"</p>

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

        <p>{txRequest.hostname}</p>

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

  if ('usbDevice' in wallet) {
    return (
      <LedgerWalletTxForm
        className={className}
        txRequest={txRequest}
        wallet={wallet}
        onDeny={deny}
      />
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <EncryptedWalletTxForm
        className={className}
        txRequest={txRequest}
        wallet={wallet}
        onDeny={deny}
      />
    );
  }

  return <div>Unknown case!</div>;
}

function LedgerWalletTxForm({
  className,
  txRequest,
  wallet,
  onDeny,
}: {
  className?: string;
  txRequest: TxRequest;
  wallet: LedgerWallet;
  onDeny: (params: { id: string }) => void;
}) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  const deny = useCallback(() => {
    onDeny(txRequest);
  }, [onDeny, txRequest]);

  const proceed = useCallback(
    async (ledgerKey: LedgerKey) => {
      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + txRequest.id,
      });

      executeTxWithLedgerWallet(
        wallet,
        txRequest.network,
        tx,
        ledgerKey,
      ).subscribe({
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
          if (txRequest.closeWindowAfterTx) {
            window.close();
          }
        },
      });
    },
    [tx, txRequest.closeWindowAfterTx, txRequest.id, txRequest.network, wallet],
  );

  return (
    <SignTxWithLedgerWallet
      wallet={wallet}
      network={txRequest.network}
      tx={tx}
      hostname={txRequest.hostname}
      date={txRequest.date}
      onDeny={deny}
      onProceed={proceed}
    />
  );
}

function EncryptedWalletTxForm({
  className,
  txRequest,
  wallet,
  onDeny,
}: {
  className?: string;
  txRequest: TxRequest;
  wallet: EncryptedWallet;
  onDeny: (params: { id: string }) => void;
}) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  const deny = useCallback(() => {
    onDeny(txRequest);
  }, [onDeny, txRequest]);

  const proceed = useCallback(
    async (decryptedWallet: Wallet) => {
      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + txRequest.id,
      });

      executeTxWithInternalWallet(
        decryptedWallet,
        txRequest.network,
        tx,
      ).subscribe({
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
    [tx, txRequest.id, txRequest.network],
  );

  return (
    <SignTxWithEncryptedWallet
      className={className}
      wallet={wallet}
      network={txRequest.network}
      tx={tx}
      hostname={txRequest.hostname}
      date={txRequest.date}
      onDeny={deny}
      onProceed={proceed}
    />
  );
}

const App = styled(AppBase)`
  max-width: 100vw;

  padding: 20px;

  font-size: 13px;
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
