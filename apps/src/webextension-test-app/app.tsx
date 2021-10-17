import {
  WalletSelectProvider,
  WebConnectorProvider,
} from '@station/web-connector-react';
import { WebConnectorController } from '@terra-dev/web-connector-controller';
import { GlobalStyle } from 'common/components/GlobalStyle';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppLayout } from 'webextension-test-app/components/AppLayout';
import { Overview } from 'webextension-test-app/pages/overview';
import './markdown.css';
import TerraConnectAPI from './pages/apis/terra-connect/api.mdx';
import TerraConnectExample from './pages/apis/terra-connect/example.mdx';

const controller = new WebConnectorController(window);

function App() {
  return (
    <WebConnectorProvider controller={controller}>
      <WalletSelectProvider>
        <AppLayout>
          <Switch>
            <Route exact path="/" component={Overview} />
            <Route path="/apis/terra-connect/api">
              <TerraConnectAPI />
            </Route>
            <Route path="/apis/terra-connect/example">
              <TerraConnectExample />
            </Route>
          </Switch>
        </AppLayout>
        <GlobalStyle backgroundColor="#ffffff" />
      </WalletSelectProvider>
    </WebConnectorProvider>
  );
}

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#root'),
);
