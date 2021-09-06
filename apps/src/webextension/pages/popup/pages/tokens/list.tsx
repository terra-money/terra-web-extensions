import { useWallet } from '@terra-dev/use-wallet';
import {
  addCW20Tokens,
  readCW20Storage,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ManageCW20Tokens } from 'webextension/components/views/ManageCW20Tokens';

export function TokensList({ history }: RouteComponentProps<{}>) {
  const { network } = useWallet();

  const [initialTokens, setInitialTokens] = useState<string[] | null>(null);

  useEffect(() => {
    readCW20Storage().then(({ cw20Tokens }) => {
      setInitialTokens(cw20Tokens[network.chainID] ?? []);
    });
  }, [network.chainID]);

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const add = useCallback(
    async (tokenAddr: string) => {
      await addCW20Tokens(network.chainID, [tokenAddr]);
    },
    [network.chainID],
  );

  const remove = useCallback(
    async (tokenAddr: string) => {
      await removeCW20Tokens(network.chainID, [tokenAddr]);
    },
    [network.chainID],
  );

  if (!initialTokens) {
    return null;
  }

  return (
    <ManageCW20Tokens
      initialTokens={initialTokens}
      onRemove={remove}
      onAdd={add}
      onClose={cancel}
    >
      <header>
        <h1>Added tokens</h1>
      </header>
    </ManageCW20Tokens>
  );
}
