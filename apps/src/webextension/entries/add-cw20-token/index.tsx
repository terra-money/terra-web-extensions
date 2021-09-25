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
  STATION_TX_REFETCH_MAP,
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
  txPortPrefix,
} from 'webextension/env';

export interface AppProps {
  className?: string;
}

function AppBase({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const addTokenInfo = useMemo(() => {
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
    hasCW20Tokens(addTokenInfo.chainID, addTokenInfo.tokenAddrs).then(
      (result) => {
        setTokensExists(
          !Object.keys(result).some((tokenAddr) => !result[tokenAddr]),
        );
      },
    );

    setInitialTokens(addTokenInfo.tokenAddrs);
  }, [addTokenInfo.chainID, addTokenInfo.tokenAddrs]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const add = useCallback(
    async (tokenAddr: string) => {
      await addCW20Tokens(addTokenInfo.chainID, [tokenAddr]);
    },
    [addTokenInfo.chainID],
  );

  const remove = useCallback(
    async (tokenAddr: string) => {
      await removeCW20Tokens(addTokenInfo.chainID, [tokenAddr]);
    },
    [addTokenInfo.chainID],
  );

  const addAll = useCallback(async () => {
    await addCW20Tokens(addTokenInfo.chainID, addTokenInfo.tokenAddrs);

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addTokenInfo.id,
    });

    port.postMessage(
      addTokenInfo.tokenAddrs.reduce((result, tokenAddr) => {
        result[tokenAddr] = true;
        return result;
      }, {} as { [tokenAddr: string]: boolean }),
    );

    port.disconnect();
  }, [addTokenInfo.chainID, addTokenInfo.id, addTokenInfo.tokenAddrs]);

  const close = useCallback(async () => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + addTokenInfo.id,
    });

    const result = await hasCW20Tokens(
      addTokenInfo.chainID,
      addTokenInfo.tokenAddrs,
    );

    port.postMessage(result);

    port.disconnect();
  }, [addTokenInfo.chainID, addTokenInfo.id, addTokenInfo.tokenAddrs]);

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
    >
      <header>
        <h1>Add tokens</h1>
      </header>
    </ManageCW20Tokens>
  );
}

export const StyledApp = styled(AppBase)`
  // TODO
`;

export const App = fixHMR(StyledApp);

const theme: DefaultTheme = createMuiTheme();

const queryClient = new QueryClient();

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppProvider
          contractAddress={STATION_CONTRACT_ADDRESS}
          constants={STATION_CONSTANTS}
          defaultWasmClient="lcd"
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
