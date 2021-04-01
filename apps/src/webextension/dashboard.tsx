import React from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorBoundary } from 'webextension/components/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { Dashboard } from './pages/dashboard';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRecover } from 'webextension/pages/wallets/recover';

function MainBase({ className }: { className?: string }) {
  const { locale, messages } = useIntlProps();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <div className={className}>
        <section>
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
        </section>
      </div>
    </IntlProvider>
  );
}

const Main = styled(MainBase)`
  min-width: 400px;

  word-break: keep-all;
  white-space: nowrap;
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
