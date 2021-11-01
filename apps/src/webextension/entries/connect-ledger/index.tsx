import { WebConnectorLedgerError } from '@terra-dev/web-connector-interface';
import {
  addWallet,
  connectLedger,
  findWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { ConnectLedger } from 'webextension/components/views/ConnectLedger';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider, useStore } from 'webextension/contexts/store';

export interface AppProps {
  className?: string;
}

function Component({ className }: AppProps) {
  const { wallets } = useStore();

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const connect = useCallback(async (name: string, design: string) => {
    const ledgerWallet = await connectLedger();

    if (ledgerWallet) {
      const existsWallet = await findWallet(ledgerWallet.terraAddress);

      if (!existsWallet) {
        const wallet = {
          ...ledgerWallet,
          name,
          design,
        };

        await addWallet(wallet);

        window.close();
      } else {
        throw new WebConnectorLedgerError(
          99999,
          `${ledgerWallet.terraAddress}는 이미 추가된 Wallet 입니다.`,
        );
      }
    }
  }, []);

  const cancel = useCallback(() => {
    window.close();
  }, []);

  return (
    <ConnectLedger
      className={className}
      wallets={wallets}
      onConnect={connect}
      onCancel={cancel}
    />
  );
}

const App = styled(Component)`
  width: 100vw;
`;

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <StoreProvider>
      <IntlProvider locale={locale} messages={messages}>
        <App />
      </IntlProvider>
    </StoreProvider>
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
