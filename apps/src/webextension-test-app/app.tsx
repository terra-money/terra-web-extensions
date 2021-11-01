import { MantineProvider } from '@mantine/core';
import { theme } from '@station/ui';
import {
  WalletSelectProvider,
  WebConnectorProvider,
} from '@station/web-connector-react';
import { WebConnectorController } from '@terra-dev/web-connector-controller';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppLayout } from 'webextension-test-app/components/AppLayout';
import { Overview } from 'webextension-test-app/pages/overview';
import { UIPreview } from 'webextension-test-app/pages/ui';
import './markdown.css';
import TerraConnectAPI from './pages/apis/terra-connect/api.mdx';
import TerraConnectExample from './pages/apis/terra-connect/example.mdx';

const controller = new WebConnectorController(window);

function App() {
  return (
    <WebConnectorProvider controller={controller}>
      <WalletSelectProvider>
        <MantineProvider theme={theme}>
          <AppLayout>
            <Switch>
              <Route exact path="/" component={Overview} />
              <Route path="/apis/terra-connect/api">
                <TerraConnectAPI />
              </Route>
              <Route path="/apis/terra-connect/example">
                <TerraConnectExample />
              </Route>
              <Route path="/ui/preview">
                <UIPreview />
              </Route>
            </Switch>
          </AppLayout>
        </MantineProvider>
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
