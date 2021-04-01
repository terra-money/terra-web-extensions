import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { Dashboard } from './pages/dashboard';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRespotre } from './pages/wallets/restore';

function MainBase({className}: {className?: string}) {
  return (
    <div className={className}>
      <section>
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/wallet/create" component={WalletCreate} />
          <Route path="/wallet/restore" component={WalletRespotre} />
          <Route
            path="/wallets/:terraAddress/password"
            component={WalletChangePassword}
          />
          <Redirect to="/" />
        </Switch>
      </section>
    </div>
  );
}

const Main = styled(MainBase)`
  min-width: 400px;
  
  word-break: keep-all;
  white-space: nowrap;
`

render(
  <HashRouter>
    <Main />
  </HashRouter>,
  document.querySelector('#app'),
);
