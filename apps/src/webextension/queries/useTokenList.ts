import { CW20Addr, NATIVE_TOKEN_ASSET_INFOS, terraswap } from '@libs/types';
import { CW20Icon, TerraBalancesWithTokenInfo } from '@libs/webapp-fns';
import {
  useCW20IconsQuery,
  useTerraBalancesWithTokenInfoQuery,
} from '@libs/webapp-provider';
import { removeCW20Tokens } from '@terra-dev/web-extension-backend';
import big from 'big.js';
import { useCallback, useMemo } from 'react';
import { useNetworks } from 'webextension/queries/useNetworks';
import { useCW20Tokens } from './useCW20Tokens';

const FALLBACK_ICON = 'https://assets.terra.money/icon/60/UST.png';

export function useTokenList():
  | Array<
      TerraBalancesWithTokenInfo['tokens'][number] & {
        icon: string;
        deleteToken: (() => void) | undefined;
      }
    >
  | undefined {
  const cw20Tokens = useCW20Tokens();

  const { data: cw20Icons = {} } = useCW20IconsQuery();

  const cw20IconMap = useMemo(() => {
    const networkKeys = Object.keys(cw20Icons);
    const map = new Map<string, CW20Icon>();

    for (const networkKey of networkKeys) {
      const tokenKeys = Object.keys(cw20Icons[networkKey]);

      for (const tokenKey of tokenKeys) {
        map.set(tokenKey, cw20Icons[networkKey][tokenKey]);
      }
    }

    return map;
  }, [cw20Icons]);

  const allTokens = useMemo<terraswap.AssetInfo[]>(() => {
    return [
      ...NATIVE_TOKEN_ASSET_INFOS,
      ...cw20Tokens.map((tokenAddr) => ({
        token: {
          contract_addr: tokenAddr as CW20Addr,
        },
      })),
    ];
  }, [cw20Tokens]);

  const { data: { tokens } = {} } = useTerraBalancesWithTokenInfoQuery(
    allTokens,
  );

  const { selectedNetwork } = useNetworks();

  const deleteToken = useCallback(
    (tokenAddr: string) => {
      console.log('useTokenList.ts..()', selectedNetwork, tokenAddr);
      if (selectedNetwork) {
        removeCW20Tokens(selectedNetwork.chainID, [tokenAddr]);
      }
    },
    [selectedNetwork],
  );

  return useMemo(() => {
    if (!tokens) {
      return undefined;
    }

    return tokens
      .filter(({ balance, asset }) => 'token' in asset || big(balance).gt(0))
      .map(({ balance, asset, info }) => {
        let icon: string = FALLBACK_ICON;
        let deleteTokenCallback: (() => void) | undefined = undefined;

        if ('native_token' in asset && info) {
          icon =
            info.symbol === 'LUNA'
              ? `https://assets.terra.money/icon/60/Luna.png`
              : `https://assets.terra.money/icon/60/${info?.symbol}.png`;
        } else if (
          'token' in asset &&
          cw20IconMap.has(asset.token.contract_addr)
        ) {
          icon = cw20IconMap.get(asset.token.contract_addr)!.icon;
        }

        if ('token' in asset) {
          deleteTokenCallback = () => deleteToken(asset.token.contract_addr);
        }

        return {
          balance,
          asset,
          info,
          icon,
          deleteToken: deleteTokenCallback,
        };
      });
  }, [cw20IconMap, deleteToken, tokens]);
}
