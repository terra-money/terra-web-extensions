import { AppProvider } from '@libs/app-provider';
import {
  addNetwork,
  findSimilarNetwork,
} from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import {
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
  STATION_TX_REFETCH_MAP,
  txPortPrefix,
} from 'webextension/env';
import { getDefaultNetworks } from 'webextension/queries/useDefaultNetworks';

export interface AppProps {
  className?: string;
}

function Component({ className }: AppProps) {
  const addNetworkQuery = useMemo(() => {
    const queries = window.location.search;

    const params = new URLSearchParams(queries);

    const id = params.get('id');
    const name = params.get('name');
    const chainID = params.get('chain-id');
    const lcd = params.get('lcd');

    if (!id || !chainID || !lcd) {
      throw new Error(`Can't find params!`);
    }

    return {
      id,
      name,
      chainID,
      lcd,
    };
  }, []);

  const [similarNetworkExists, setSimilarNetworkExists] =
    useState<boolean>(false);

  const [name, setName] = useState<string>(() => addNetworkQuery.name ?? '');

  useEffect(() => {
    getDefaultNetworks()
      .then((defaultNetworks) =>
        findSimilarNetwork(
          defaultNetworks,
          addNetworkQuery.chainID,
          addNetworkQuery.lcd,
        ),
      )
      .then((foundNetwork) => {
        setSimilarNetworkExists(!!foundNetwork);
      });
  }, [addNetworkQuery.chainID, addNetworkQuery.lcd]);

  const add = useCallback(async () => {
    await addNetwork({
      name,
      chainID: addNetworkQuery.chainID,
      lcd: addNetworkQuery.lcd,
    });

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addNetworkQuery.id,
    });

    port.postMessage(true);

    port.disconnect();
  }, [addNetworkQuery.chainID, addNetworkQuery.id, addNetworkQuery.lcd, name]);

  const close = useCallback(async () => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addNetworkQuery.id,
    });

    port.postMessage(false);

    port.disconnect();
  }, [addNetworkQuery.id]);

  if (similarNetworkExists) {
    return (
      <div>
        <pre>{JSON.stringify(addNetworkQuery, null, 2)}</pre>
        <p>Already exists the network</p>
        <button onClick={close}>Close</button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        type="text"
        value={name}
        onChange={({ currentTarget }) => setName(currentTarget.value)}
      />

      <ul>
        <li>chainID: {addNetworkQuery.chainID}</li>
        <li>lcd: {addNetworkQuery.lcd}</li>
      </ul>

      <footer>
        <button onClick={close}>Cancel</button>
        <button onClick={add}>Add</button>
      </footer>
    </div>
  );
}

const StyledComponent = styled(Component)`
  // TODO
`;

export const App = fixHMR(StyledComponent);

const queryClient = new QueryClient();

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppProvider
          defaultQueryClient="lcd"
          contractAddress={STATION_CONTRACT_ADDRESS}
          constants={STATION_CONSTANTS}
          refetchMap={STATION_TX_REFETCH_MAP}
        >
          <IntlProvider locale={locale} messages={messages}>
            <App />
          </IntlProvider>
        </AppProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

render(
  <ErrorBoundary>
    <LocalesProvider>
      <Main />
    </LocalesProvider>
  </ErrorBoundary>,
  document.querySelector('#app'),
);
