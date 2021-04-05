import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalStyle } from './components/GlobalStyle';
import { PopupHeader } from './components/PopupHeader';
import { LocalesProvider, useIntlProps } from './contexts/locales';
import { headerHeight, contentHeight, width } from './env';
import { Dashboard } from './pages/dashboard';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRecover } from './pages/wallets/recover';

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
    <IntlProvider locale={locale} messages={messages}>
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
            <Route path="/network/create" component={NetworkCreate} />
            <Redirect to="/" />
          </Switch>
          {Array.from({ length: 100 }).map((_, a) => (
            <p key={'scroll' + a}>A</p>
          ))}
        </section>
        <GlobalStyle />
      </div>
    </IntlProvider>
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
    padding-bottom: ${headerHeight}px;

    overflow-x: hidden;
    overflow-y: auto;

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
