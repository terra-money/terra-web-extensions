import { AppProvider } from '@libs/app-provider';
import { createMuiTheme } from '@material-ui/core';
import {
  addCW20Tokens,
  hasCW20Tokens,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { AlreadyCW20TokensExists } from 'webextension/components/views/AlreadyCW20TokensExists';
import { ManageCW20Tokens } from 'webextension/components/views/ManageCW20Tokens';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import { ThemeProvider } from 'webextension/contexts/theme';
import {
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
  STATION_TX_REFETCH_MAP,
  txPortPrefix,
} from 'webextension/env';

export interface AppProps {
  className?: string;
}

function Component({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const addTokenQuery = useMemo(() => {
    const queries = window.location.search;

    const params = new URLSearchParams(queries);

    const id = params.get('id');
    const chainID = params.get('chain-id');
    const tokenAddrs = params.get('token-addrs')?.split(',');

    if (!id || !chainID || !Array.isArray(tokenAddrs)) {
      throw new Error(`Can't find params!`);
    }

    return {
      id,
      chainID,
      tokenAddrs,
    };
  }, []);

  const [tokensExists, setTokensExists] = useState<boolean>(false);

  const [initialTokens, setInitialTokens] = useState<string[]>(() => []);

  useEffect(() => {
    hasCW20Tokens(addTokenQuery.chainID, addTokenQuery.tokenAddrs).then(
      (result) => {
        setTokensExists(
          !Object.keys(result).some((tokenAddr) => !result[tokenAddr]),
        );
      },
    );

    setInitialTokens(addTokenQuery.tokenAddrs);
  }, [addTokenQuery.chainID, addTokenQuery.tokenAddrs]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const add = useCallback(
    async (tokenAddr: string) => {
      await addCW20Tokens(addTokenQuery.chainID, [tokenAddr]);
    },
    [addTokenQuery.chainID],
  );

  const remove = useCallback(
    async (tokenAddr: string) => {
      await removeCW20Tokens(addTokenQuery.chainID, [tokenAddr]);
    },
    [addTokenQuery.chainID],
  );

  const addAll = useCallback(async () => {
    await addCW20Tokens(addTokenQuery.chainID, addTokenQuery.tokenAddrs);

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addTokenQuery.id,
    });

    port.postMessage(
      addTokenQuery.tokenAddrs.reduce((result, tokenAddr) => {
        result[tokenAddr] = true;
        return result;
      }, {} as { [tokenAddr: string]: boolean }),
    );

    port.disconnect();
  }, [addTokenQuery.chainID, addTokenQuery.id, addTokenQuery.tokenAddrs]);

  const close = useCallback(async () => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addTokenQuery.id,
    });

    const result = await hasCW20Tokens(
      addTokenQuery.chainID,
      addTokenQuery.tokenAddrs,
    );

    port.postMessage(result);

    port.disconnect();
  }, [addTokenQuery.chainID, addTokenQuery.id, addTokenQuery.tokenAddrs]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (tokensExists) {
    return (
      <AlreadyCW20TokensExists onConfirm={close}>
        <header>
          <h1>Add tokens</h1>
        </header>
      </AlreadyCW20TokensExists>
    );
  }

  return (
    <ManageCW20Tokens
      initialTokens={initialTokens}
      onRemove={remove}
      onAdd={add}
      onAddAll={addAll}
      onClose={close}
    />
  );
}

export const StyledComponent = styled(Component)`
  // TODO
`;

const App = fixHMR(StyledComponent);

const theme: DefaultTheme = createMuiTheme();

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
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
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
