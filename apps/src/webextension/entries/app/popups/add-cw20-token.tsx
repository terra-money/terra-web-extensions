import {
  addCW20Tokens,
  hasCW20Tokens,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { AlreadyCW20TokensExists } from 'webextension/components/views/AlreadyCW20TokensExists';
import { ManageCW20Tokens } from 'webextension/components/views/ManageCW20Tokens';
import { useAllowedCommandId } from 'webextension/contexts/commands';
import { txPortPrefix } from 'webextension/env';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';

export function AddCw20TokenPopup() {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const { search } = useLocation();

  const addTokenQuery = useMemo(() => {
    const params = new URLSearchParams(search);

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
  }, [search]);

  useAllowedCommandId(addTokenQuery.id, '/error/abnormal-approach');

  const [tokensExists, setTokensExists] = useState<boolean>(false);

  const [initialTokens, setInitialTokens] = useState<string[]>(() => []);

  const existsTokens = useCW20Tokens();

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
      <Center>
        <AlreadyCW20TokensExists onConfirm={close} />
      </Center>
    );
  }

  return (
    <Padding>
      <ManageCW20Tokens
        initialTokens={initialTokens}
        existsTokens={existsTokens}
        onRemove={remove}
        onAdd={add}
        onAddAll={addAll}
        onClose={close}
      />
    </Padding>
  );
}

const Center = styled.div`
  .content {
    height: 100vh;
  }
`;

const Padding = styled.div`
  padding: 20px;
`;
