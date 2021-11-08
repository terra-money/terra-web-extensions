import { useTerraBalancesWithTokenInfoQuery } from '@libs/app-provider';
import {
  CW20Addr,
  HumanAddr,
  NATIVE_TOKEN_DENOMS,
  NativeDenom,
  terraswap,
} from '@libs/types';
import { AccAddress } from '@terra-money/terra.js';
import React, { useCallback, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { CanNotFinToken } from 'webextension/components/views/CanNotFindToken';
import { InProgress } from 'webextension/components/views/InProgress';
import { TokenInfo } from 'webextension/components/views/TokenInfo';

export function WalletToken({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string; token: string }>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const asset = useMemo<terraswap.AssetInfo[]>(() => {
    const token = match.params.token;
    return NATIVE_TOKEN_DENOMS.indexOf(token) > -1
      ? [
          {
            native_token: {
              denom: token as NativeDenom,
            },
          },
        ]
      : AccAddress.validate(token)
      ? [
          {
            token: {
              contract_addr: token as CW20Addr,
            },
          },
        ]
      : [];
  }, [match.params.token]);

  const { data: tokens } = useTerraBalancesWithTokenInfoQuery(
    asset,
    match.params.terraAddress as HumanAddr,
  );

  if (asset.length === 0) {
    return (
      <SubLayout title="Token" onBack={cancel}>
        <CanNotFinToken token={match.params.token} onConfirm={cancel} />
      </SubLayout>
    );
  }

  if (!tokens) {
    return (
      <SubLayout title="Token" onBack={cancel}>
        <InProgress title="Searching for token" />
      </SubLayout>
    );
  }

  if (tokens.tokens.length === 0) {
    return (
      <SubLayout title="Token" onBack={cancel}>
        <CanNotFinToken token={match.params.token} onConfirm={cancel} />
      </SubLayout>
    );
  }

  return (
    <SubLayout title={tokens.tokens[0].info?.symbol ?? 'Token'} onBack={cancel}>
      <TokenInfo
        terraAddress={match.params.terraAddress}
        token={tokens.tokens[0]}
      />
    </SubLayout>
  );
}
