import { defaultMantleFetch, MantleFetch } from '@libs/mantle';
import { cw20, terraswap, Token } from '@libs/types';
import { nativeTokenInfoQuery } from '../cw20/nativeTokenInfo';
import { cw20TokenInfoQuery } from '../cw20/tokenInfo';

export async function terraTokenInfoQuery<T extends Token>(
  asset: terraswap.AssetInfo,
  mantleEndpoint: string,
  mantleFetch: MantleFetch = defaultMantleFetch,
  requestInit?: RequestInit,
): Promise<cw20.TokenInfoResponse<T> | undefined> {
  return 'native_token' in asset
    ? nativeTokenInfoQuery<T>(asset.native_token.denom)
    : cw20TokenInfoQuery<T>(
        asset.token.contract_addr,
        mantleEndpoint,
        mantleFetch,
        requestInit,
      ).then(({ tokenInfo }) => tokenInfo);
}
