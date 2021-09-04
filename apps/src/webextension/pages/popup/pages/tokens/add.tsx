import { FormLayout } from '@libs/station-ui/components/FormLayout';
import { FormSection } from '@libs/station-ui/components/FormSection';
import { CW20Addr, Token } from '@libs/types';
import { CW20TokenInfo, cw20TokenInfoQuery } from '@libs/webapp-fns';
import { useTerraWebapp } from '@libs/webapp-provider';
import { Button, TextField } from '@material-ui/core';
import { useWallet } from '@terra-dev/use-wallet';
import { addCW20Tokens } from '@terra-dev/web-extension-backend';
import { AccAddress } from '@terra-money/terra.js';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

export function TokensAdd({ history }: RouteComponentProps<{}>) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { network } = useWallet();
  const { mantleEndpoint, mantleFetch } = useTerraWebapp();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [tokenAddr, setTokenAddr] = useState<string>('');

  const [tokenInfo, setTokenInfo] = useState<CW20TokenInfo<Token> | null>(null);

  const invalidTokenAddr = useMemo(() => {
    if (tokenAddr.length === 0) {
      return null;
    }

    return !AccAddress.validate(tokenAddr) ? 'Invalid Token Address' : null;
  }, [tokenAddr]);

  const findTokenInfo = useCallback(() => {
    cw20TokenInfoQuery(tokenAddr as CW20Addr, mantleEndpoint, mantleFetch).then(
      setTokenInfo,
    );
  }, [mantleEndpoint, mantleFetch, tokenAddr]);

  const addToken = useCallback(async () => {
    await addCW20Tokens(network.chainID, [tokenAddr]);
    history.push('/');
  }, [history, network.chainID, tokenAddr]);

  return (
    <FormSection>
      <header>
        <h1>Add CW20 Token</h1>
      </header>

      {tokenInfo ? (
        <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
      ) : (
        <FormLayout>
          <TextField
            type="text"
            size="small"
            label="CW20 Token Address"
            InputLabelProps={{ shrink: true }}
            value={tokenAddr}
            error={!!invalidTokenAddr}
            helperText={invalidTokenAddr}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setTokenAddr(target.value)
            }
          />
        </FormLayout>
      )}

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>

        {tokenInfo ? (
          <Button variant="contained" color="primary" onClick={addToken}>
            Add Token
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={tokenAddr.length === 0 || !!invalidTokenAddr}
            onClick={findTokenInfo}
          >
            Find Token Info
          </Button>
        )}
      </footer>
    </FormSection>
  );
}
