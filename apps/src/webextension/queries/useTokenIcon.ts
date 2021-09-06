import { cw20, terraswap, Token } from '@libs/types';
import { CW20Icon } from '@libs/webapp-fns';
import { useCW20IconsQuery } from '@libs/webapp-provider';
import { useCallback, useMemo } from 'react';

const FALLBACK_ICON = 'https://assets.terra.money/icon/60/UST.png';

export function useTokenIcon() {
  const { data: cw20Icons } = useCW20IconsQuery();

  const cw20IconMap = useMemo(() => {
    const icons = cw20Icons ?? {};

    const networkKeys = Object.keys(icons);
    const map = new Map<string, CW20Icon>();

    for (const networkKey of networkKeys) {
      const tokenKeys = Object.keys(icons[networkKey]);

      for (const tokenKey of tokenKeys) {
        map.set(tokenKey, icons[networkKey][tokenKey]);
      }
    }

    return map;
  }, [cw20Icons]);

  return useCallback(
    (
      asset: terraswap.AssetInfo,
      info?: cw20.TokenInfoResponse<Token> | undefined,
    ) => {
      let icon: string = FALLBACK_ICON;

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

      return icon;
    },
    [cw20IconMap],
  );
}
