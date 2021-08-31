import { NATIVE_TOKEN_ASSET_INFOS } from '@libs/types';
import { TerraBalancesWithTokenInfo } from '@libs/webapp-fns';
import { useTerraBalancesWithTokenInfoQuery } from '@libs/webapp-provider';
import big from 'big.js';
import { useMemo } from 'react';

export function useTokenBalances():
  | Array<TerraBalancesWithTokenInfo['tokens'][number] & { icon: string }>
  | undefined {
  const { data: { tokens } = {} } = useTerraBalancesWithTokenInfoQuery(
    NATIVE_TOKEN_ASSET_INFOS,
  );

  return useMemo(() => {
    if (!tokens) {
      return undefined;
    }

    return tokens
      .filter(({ balance }) => big(balance).gt(0))
      .map(({ balance, asset, info }) => {
        return {
          balance,
          asset,
          info,
          icon: !info
            ? `https://assets.terra.money/icon/60/UST.png`
            : info.symbol === 'LUNA'
            ? `https://assets.terra.money/icon/60/Luna.png`
            : `https://assets.terra.money/icon/60/${info?.symbol}.png`,
        };
      });
  }, [tokens]);
}
