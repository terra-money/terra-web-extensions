import { AppProvider } from '@libs/app-provider';
import { createMuiTheme } from '@material-ui/core';
import { yScroller } from '@station/ui';
import { GlobalStyle } from 'common/components/GlobalStyle';
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
import styled, { DefaultTheme } from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import { ThemeProvider } from 'webextension/contexts/theme';
import {
  STATION_TX_REFETCH_MAP,
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
} from 'webextension/env';
import { Header } from './components/Header';
import { POPUP_CONTENT_HEIGHT, POPUP_HEADER_HEIGHT, POPUP_WIDTH } from './env';
import { DApps } from './pages/dapps';
import { Dashboard } from './pages/dashboard';
import { LedgerVerify } from './pages/ledger/verify';
import { NetworksCreate } from './pages/networks/create';
import { TokensAdd } from './pages/tokens/add';
import { TokensList } from './pages/tokens/list';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletsCreate } from './pages/wallets/create';
import { WalletExport } from './pages/wallets/export';
import { WalletQR } from './pages/wallets/qr';
import { WalletsRecover } from './pages/wallets/recover';
import { WalletSend } from './pages/wallets/send';
import { WalletUpdate } from './pages/wallets/update';

const theme: DefaultTheme = createMuiTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const queryClient = new QueryClient();

function MainBase({ className }: { className?: string }) {
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
          defaultWasmClient="lcd"
          refetchMap={STATION_TX_REFETCH_MAP}
        >
          <IntlProvider locale={locale} messages={messages}>
            <ThemeProvider theme={theme}>
              <GlobalStyle />
              <div className={className}>
                <Header />
                <section ref={containerRef} style={{ position: 'relative' }}>
                  <Switch>
                    <Route exact path="/" component={Dashboard} />
                    <Route
                      exact
                      path="/wallets/create"
                      component={WalletsCreate}
                    />
                    <Route
                      exact
                      path="/wallets/recover"
                      component={WalletsRecover}
                    />
                    <Route
                      path="/wallet/:terraAddress/qr"
                      component={WalletQR}
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
                    <Route
                      exact
                      path="/ledger/verify"
                      component={LedgerVerify}
                    />
                    <Route
                      exact
                      path="/networks/create"
                      component={NetworksCreate}
                    />
                    <Route exact path="/tokens" component={TokensList} />
                    <Route exact path="/tokens/add" component={TokensAdd} />
                    <Redirect to="/" />
                  </Switch>
                </section>
              </div>
            </ThemeProvider>
          </IntlProvider>
        </AppProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

const Main = styled(MainBase)`
  min-width: ${POPUP_WIDTH}px;
  min-height: ${POPUP_HEADER_HEIGHT + POPUP_CONTENT_HEIGHT}px;
  max-height: ${POPUP_HEADER_HEIGHT + POPUP_CONTENT_HEIGHT}px;

  display: flex;
  flex-direction: column;

  > section {
    min-height: ${POPUP_CONTENT_HEIGHT}px;
    max-height: ${POPUP_CONTENT_HEIGHT}px;
    padding: 20px;

    ${yScroller};

    background-color: #ffffff;

    border-top-left-radius: 24px;
    border-top-right-radius: 24px;

    box-shadow: 0 4px 18px 3px rgba(0, 0, 0, 0.33);
  }
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
