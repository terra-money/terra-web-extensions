import { WalletCreate } from 'app/pages/wallets/create';
import { WalletList } from 'app/pages/wallets/list';
import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Link, Redirect, Route, Switch } from 'react-router-dom';

function Options() {
  return (
    <div>
      <header>
        <ul>
          <li>
            <Link to="/">Wallet List</Link>
          </li>
        </ul>
      </header>
      <section>
        <Switch>
          <Route exact path="/" component={WalletList} />
          <Route path="/create" component={WalletCreate} />
          <Redirect to="/" />
        </Switch>
      </section>
    </div>
  );
}

render(
  <HashRouter>
    <Options />
  </HashRouter>,
  document.querySelector('#app'),
);
