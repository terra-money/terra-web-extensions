import { FormSection } from '@libs/station-ui/components/FormSection';
import { Button, createMuiTheme } from '@material-ui/core';
import { WebExtensionTxStatus } from '@terra-dev/web-extension';
import {
  approveHostnames,
  EncryptedWallet,
  findWallet,
  fromURLSearchParams,
  LedgerWallet,
  readHostnamesStorage,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { InternalWalletTxForm } from '../../components/tx/InternalWalletTxForm';
import { LedgerWalletTxForm } from '../../components/tx/LedgerWalletTxForm';
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

  const [needApproveHostname, setNeedApproveHostname] = useState<boolean>(
    false,
  );

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
        onComplete={() => window.close()}
      />
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <InternalWalletTxForm
        className={className}
        txRequest={txRequest}
        wallet={wallet}
        onDeny={deny}
      />
    );
  }

  return <div>Unknown case!</div>;
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
