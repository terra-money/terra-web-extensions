import { AppProvider } from '@libs/app-provider';
import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import { AddNetworkPopup } from 'webextension/entries/app/popups/add-network';
import { ConnectPopup } from 'webextension/entries/app/popups/connect';
import { TxPopup } from 'webextension/entries/app/popups/tx';
import {
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
  STATION_TX_REFETCH_MAP,
} from 'webextension/env';
import { DApps } from './pages/dapps';
import { Dashboard } from './pages/dashboard';
import { LedgerVerify } from './pages/ledger/verify';
import { NetworksCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletsCreate } from './pages/wallets/create';
import { WalletExport } from './pages/wallets/export';
import { WalletsRecover } from './pages/wallets/recover';
import { WalletSend } from './pages/wallets/send';
import { WalletUpdate } from './pages/wallets/update';
import { AddCw20TokenPopup } from './popups/add-cw20-token';
import { ConnectLedgerPopup } from './popups/connect-ledger';

const queryClient = new QueryClient();

function Component({ className }: { className?: string }) {
  const { locale, messages } = useIntlProps();

  const location = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppProvider
          contractAddress={STATION_CONTRACT_ADDRESS}
          constants={STATION_CONSTANTS}
          defaultQueryClient="lcd"
          refetchMap={STATION_TX_REFETCH_MAP}
        >
          <IntlProvider locale={locale} messages={messages}>
            <main className={className} ref={containerRef}>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/wallets/create" component={WalletsCreate} />
                <Route
                  exact
                  path="/wallets/recover"
                  component={WalletsRecover}
                />
                <Route
                  path="/wallet/:terraAddress/update"
                  component={WalletUpdate}
                />
                <Route
                  path="/wallet/:terraAddress/password"
                  component={WalletChangePassword}
                />
                <Route
                  path="/wallet/:terraAddress/export"
                  component={WalletExport}
                />
                <Route
                  path="/wallet/:terraAddress/send/:token"
                  component={WalletSend}
                />
                <Route exact path="/dapps" component={DApps} />
                <Route exact path="/ledger/verify" component={LedgerVerify} />
                <Route
                  exact
                  path="/networks/create"
                  component={NetworksCreate}
                />
                {/* popups */}
                <Route
                  exact
                  path="/connect-ledger"
                  component={ConnectLedgerPopup}
                />
                <Route exact path="/connect" component={ConnectPopup} />
                <Route exact path="/tx" component={TxPopup} />
                <Route exact path="/add-network" component={AddNetworkPopup} />
                <Route
                  exact
                  path="/add-cw20-token"
                  component={AddCw20TokenPopup}
                />
                <Redirect to="/" />
              </Switch>
            </main>
          </IntlProvider>
        </AppProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export const Main = styled(Component)`
  background-color: var(--color-content-background);
`;

render(
  <HashRouter>
    <ErrorBoundary>
      <LocalesProvider>
        <Main />
      </LocalesProvider>
    </ErrorBoundary>
  </HashRouter>,
  document.querySelector('#app'),
);