import { AppProvider } from '@libs/app-provider';
import { createMuiTheme } from '@material-ui/core';
import { GlobalStyle } from 'common/components/GlobalStyle';
import { fixHMR } from 'fix-hmr';
import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter, Route, Switch, useLocation } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import { ThemeProvider } from 'webextension/contexts/theme';
import {
  APP_TX_REFETCH_MAP,
  appConstants,
  appContractAddress,
} from 'webextension/env';
import { Header } from './components/Header';
import { Dashboard } from './pages/dashboard';

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
          contractAddress={appContractAddress}
          constants={appConstants}
          defaultWasmClient="lcd"
          refetchMap={APP_TX_REFETCH_MAP}
        >
          <IntlProvider locale={locale} messages={messages}>
            <ThemeProvider theme={theme}>
              <GlobalStyle backgroundColor="#ffffff" />
              <div className={className}>
                <Header />
                <section ref={containerRef} style={{ position: 'relative' }}>
                  <Switch>
                    <Route exact path="/" component={Dashboard} />
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

export const StyledMain = styled(MainBase)`
  // TODO
`;

export const Main = fixHMR(StyledMain);

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
