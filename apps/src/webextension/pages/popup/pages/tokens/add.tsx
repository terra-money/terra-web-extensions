import { useWallet } from '@terra-dev/use-wallet';
import { addCW20Tokens } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  AddCW20Token,
  AddCW20TokenResult,
} from 'webextension/components/views/AddCW20Token';

export function TokensAdd({ history }: RouteComponentProps<{}>) {
  const { network } = useWallet();

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const add = useCallback(
    async ({ tokenAddr }: AddCW20TokenResult) => {
      await addCW20Tokens(network.chainID, [tokenAddr]);
    },
    [network.chainID],
  );

  return (
    <AddCW20Token onAdd={add} onClose={cancel}>
      <header>
        <h1>Add token</h1>
      </header>
    </AddCW20Token>
  );
}
