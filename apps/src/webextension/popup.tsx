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
import { animated, useTransition } from 'react-spring';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { ErrorBoundary } from 'webextension/components/ErrorBoundary';
import { PopupHeader } from 'webextension/components/PopupHeader';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { headerHeight, height, width } from 'webextension/env';
import { WalletRecover } from 'webextension/pages/wallets/recover';
import { Dashboard } from './pages/dashboard';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';

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

  const transitions = useTransition(location, ({ pathname }) => pathname, {
    from: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(-100%)' },
  });

  return (
    <IntlProvider locale={locale} messages={messages}>
      <div className={className} ref={containerRef}>
        <PopupHeader />
        <section>
          {transitions.map(({ item: targetLocation, props, key }) => (
            <animated.div
              key={key}
              style={{ ...props, transformOrigin: 'top' }}
            >
              <Switch location={targetLocation}>
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
            </animated.div>
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

const GlobalStyle = createGlobalStyle`
  :root {
    background-color: #0c3694;
  }
  
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
  }
  
  ::-webkit-scrollbar {
    display: none;
  }
  
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Main = styled(MainBase)`
  min-width: ${width}px;
  max-height: ${height}px;

  padding-top: ${headerHeight}px;

  word-break: keep-all;
  white-space: nowrap;

  overflow-x: hidden;
  overflow-y: scroll;

  > section {
    min-height: ${height}px;

    background-color: #ffffff;

    border-top-left-radius: 20px;
    border-top-right-radius: 20px;

    box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.33);

    animation: ${sectionEnter} 0.6s ease-in;

    position: relative;

    > div {
      padding: 20px;

      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
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
