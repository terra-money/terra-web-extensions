import { cw20, Luna, NativeDenom, Token, u, UST } from '@libs/types';

export function nativeTokenInfoQuery(
  denom: NativeDenom,
): cw20.TokenInfoResponse<Token> | undefined {
  switch (denom) {
    case 'uust':
    case 'uusd':
      return {
        decimals: 6,
        name: 'UST',
        symbol: 'UST',
        total_supply: '0' as u<UST>,
      };
    case 'uluna':
      return {
        decimals: 6,
        name: 'LUNA',
        symbol: 'LUNA',
        total_supply: '0' as u<Luna>,
      };
  }

  return undefined;
}
