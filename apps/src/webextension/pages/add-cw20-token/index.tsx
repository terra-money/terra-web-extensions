import { FormSection } from '@libs/station-ui/components/FormSection';
import { cw20, CW20Addr, Token } from '@libs/types';
import { cw20TokenInfoQuery } from '@libs/webapp-fns';
import { TerraWebappProvider } from '@libs/webapp-provider';
import { Button, createMuiTheme } from '@material-ui/core';
import { addCW20Tokens, hasCW20Tokens } from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { StoreProvider } from 'webextension/contexts/store';
import { ThemeProvider } from 'webextension/contexts/theme';
import { txPortPrefix } from 'webextension/env';

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

  const [hasTokens, setHasTokens] = useState<{
    [tokenAddr: string]: boolean;
  } | null>(null);

  useEffect(() => {
    hasCW20Tokens(addTokenInfo.chainID, addTokenInfo.tokenAddrs).then(
      (result) => {
        setHasTokens(result);
      },
    );
  }, [addTokenInfo.chainID, addTokenInfo.tokenAddrs]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const approve = useCallback(async () => {
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

  const deny = useCallback(async () => {
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

  return (
    <FormSection className={className}>
      <header>
        <h1>Approve this site?</h1>
      </header>

      {hasTokens &&
        addTokenInfo.tokenAddrs
          .filter((tokenAddr) => !hasTokens[tokenAddr])
          .map((tokenAddr) => (
            <TokenInfo
              key={tokenAddr}
              chainID={addTokenInfo.chainID}
              tokenAddr={tokenAddr}
            />
          ))}

      <footer>
        <Button variant="contained" color="secondary" onClick={deny}>
          Deny
        </Button>
        <Button variant="contained" color="primary" onClick={approve}>
          Approve
        </Button>
      </footer>
    </FormSection>
  );
}

function TokenInfo({
  chainID,
  tokenAddr,
}: {
  chainID: string;
  tokenAddr: string;
}) {
  const [info, setInfo] = useState<cw20.TokenInfoResponse<Token> | null>(null);

  useEffect(() => {
    cw20TokenInfoQuery(
      tokenAddr as CW20Addr,
      // TODO mapping mantle endpoint by chainID
      'https://tequila-mantle.anchorprotocol.com',
    ).then(({ tokenInfo }) => setInfo(tokenInfo));
  }, [tokenAddr]);

  return <pre>{JSON.stringify(info, null, 2)}</pre>;
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
        <TerraWebappProvider>
          <IntlProvider locale={locale} messages={messages}>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </IntlProvider>
        </TerraWebappProvider>
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
