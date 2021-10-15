import { CW20TokenDisplayInfo } from '@libs/app-fns';
import { useCW20TokenDisplayInfosQuery } from '@libs/app-provider';
import { cw20, terraswap, Token } from '@libs/types';
import { useCallback, useMemo } from 'react';

const FALLBACK_ICON = 'https://assets.terra.money/icon/60/UST.png';

export function useTokenIcon() {
  const { data: cw20TokenDisplayInfos } = useCW20TokenDisplayInfosQuery();

  const cw20IconMap = useMemo(() => {
    const icons = cw20TokenDisplayInfos ?? {};

    const networkKeys = Object.keys(icons);
    const map = new Map<string, CW20TokenDisplayInfo>();

    for (const networkKey of networkKeys) {
      const tokenKeys = Object.keys(icons[networkKey]);

      for (const tokenKey of tokenKeys) {
        map.set(tokenKey, icons[networkKey][tokenKey]);
      }
    }

    return map;
  }, [cw20TokenDisplayInfos]);

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
