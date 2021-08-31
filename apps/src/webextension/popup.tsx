import { yScroller } from '@libs/station-ui/styles/yScroller';
import { TerraWebappProvider } from '@libs/webapp-provider';
import { createMuiTheme } from '@material-ui/core';
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
import styled, { DefaultTheme, keyframes } from 'styled-components';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PopupHeader } from './components/popup/PopupHeader';
import { LocalesProvider, useIntlProps } from './contexts/locales';
import { ThemeProvider } from './contexts/theme';
import { WebExtensionInternalWalletProvider } from './contexts/wallet-provider';
import { contentHeight, headerHeight, width } from './env';
import { Dashboard } from './pages/dashboard';
import { ApprovedHostnames } from './pages/hostnames/approved-hostnames';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRecover } from './pages/wallets/recover';

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

  useEffect(() => {
    setTimeout(() => {
      if (!containerRef.current) return;
      containerRef.current.style.minHeight = contentHeight + 'px';
      containerRef.current.style.maxHeight = contentHeight + 'px';
    }, 2000);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WebExtensionInternalWalletProvider>
        <TerraWebappProvider>
          <IntlProvider locale={locale} messages={messages}>
            <ThemeProvider theme={theme}>
              <div className={className}>
                <PopupHeader />
                <section ref={containerRef}>
                  <Switch>
                    <Route exact path="/" component={Dashboard} />
                    <Route path="/wallet/create" component={WalletCreate} />
                    <Route path="/wallet/recover" component={WalletRecover} />
                    <Route
                      path="/wallets/:terraAddress/password"
                      component={WalletChangePassword}
                    />
                    <Route path="/hostnames" component={ApprovedHostnames} />
                    <Route path="/network/create" component={NetworkCreate} />
                    <Redirect to="/" />
                  </Switch>
                </section>
                <GlobalStyle />
              </div>
            </ThemeProvider>
          </IntlProvider>
        </TerraWebappProvider>
      </WebExtensionInternalWalletProvider>
    </QueryClientProvider>
  );
}

const sectionEnter = keyframes`
  0% {
    transform: translateY(-${headerHeight}px);
  }
  
  30% {
    transform: translateY(-${headerHeight}px);
  }
  
  100% {
    transform: translateY(0);
  }
`;

const Main = styled(MainBase)`
  min-width: ${width}px;
  min-height: ${headerHeight + contentHeight}px;
  max-height: ${headerHeight + contentHeight}px;

  display: flex;
  flex-direction: column;

  > section {
    min-height: ${headerHeight + contentHeight}px;
    max-height: ${headerHeight + contentHeight}px;
    padding: 20px;

    ${yScroller};

    background-color: #ffffff;

    border-top-left-radius: 24px;
    border-top-right-radius: 24px;

    box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.33);

    animation: ${sectionEnter} 0.6s ease-in;
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
