import { TerraBalancesWithTokenInfo } from '@libs/app-fns';
import { useTerraBalancesWithTokenInfoQuery } from '@libs/app-provider';
import { CW20Addr, NATIVE_TOKEN_ASSET_INFOS, terraswap } from '@libs/types';
import big from 'big.js';
import { useMemo } from 'react';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';
import { useCW20Tokens } from './useCW20Tokens';

export function useTokenList():
  | Array<
      TerraBalancesWithTokenInfo['tokens'][number] & {
        icon: string;
        isCW20Token: boolean;
      }
    >
  | undefined {
  const cw20Tokens = useCW20Tokens();

  const getTokenIcon = useTokenIcon();

  const allTokens = useMemo<terraswap.AssetInfo[]>(() => {
    return [
      ...NATIVE_TOKEN_ASSET_INFOS,
      ...Array.from(cw20Tokens).map((tokenAddr) => ({
        token: {
          contract_addr: tokenAddr as CW20Addr,
        },
      })),
    ];
  }, [cw20Tokens]);

  const { data: { tokens } = {} } =
    useTerraBalancesWithTokenInfoQuery(allTokens);

  //const { selectedNetwork } = useNetworks();

  //const deleteToken = useCallback(
  //  (tokenAddr: string) => {
  //    console.log('useTokenList.ts..()', selectedNetwork, tokenAddr);
  //    if (selectedNetwork) {
  //      removeCW20Tokens(selectedNetwork.chainID, [tokenAddr]);
  //    }
  //  },
  //  [selectedNetwork],
  //);

  return useMemo(() => {
    if (!tokens) {
      return undefined;
    }

    return tokens
      .filter(({ balance, asset }) => 'token' in asset || big(balance).gt(0))
      .map(({ balance, asset, info }) => {
        const icon: string = getTokenIcon(asset, info);

        return {
          balance,
          asset,
          info,
          icon,
          isCW20Token: 'token' in asset,
        };
      });
  }, [getTokenIcon, tokens]);
}
