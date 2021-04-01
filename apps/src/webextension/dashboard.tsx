import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { Dashboard } from './pages/dashboard';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRespotre } from './pages/wallets/restore';

export interface ErrorBoundaryProps {}

interface ErrorBoundaryState {
  error: null | Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
    });

    console.error(errorInfo);
  }

  render() {
    if (this.state.error) {
      return <ErrorView>{this.state.error.toString()}</ErrorView>;
    }

    return this.props.children;
  }
}

const ErrorView = styled.pre`
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  font-size: 12px;
`;

function MainBase({ className }: { className?: string }) {
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
          <Route path="/network/create" component={NetworkCreate} />
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
`;

render(
  <HashRouter>
    <ErrorBoundary>
      <Main />
    </ErrorBoundary>
  </HashRouter>,
  document.querySelector('#app'),
);