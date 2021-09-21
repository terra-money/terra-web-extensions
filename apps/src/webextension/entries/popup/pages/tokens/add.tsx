import { useWallet } from '@terra-dev/use-wallet';
import {
  addCW20Tokens,
  removeCW20Tokens,
} from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AddCW20Token } from 'webextension/components/views/AddCW20Token';

export function TokensAdd({ history }: RouteComponentProps<{}>) {
  const { network } = useWallet();

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

  return (
    <AddCW20Token onAdd={add} onRemove={remove} onClose={cancel}>
      <header>
        <h1>Add token</h1>
      </header>
    </AddCW20Token>
  );
}
