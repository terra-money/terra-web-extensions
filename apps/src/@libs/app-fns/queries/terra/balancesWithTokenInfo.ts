import { WasmClient } from '@libs/query-client';
import { cw20, HumanAddr, terraswap, Token, u } from '@libs/types';
import { nativeTokenInfoQuery } from '../cw20/nativeTokenInfo';
import { cw20TokenInfoQuery } from '../cw20/tokenInfo';
import { terraBalancesQuery } from './balances';

export type TerraBalancesWithTokenInfo = {
  tokens: Array<{
    asset: terraswap.AssetInfo;
    balance: u<Token>;
    info: cw20.TokenInfoResponse<Token> | undefined;
  }>;
};

export async function terraBalancesWithTokenInfoQuery(
  walletAddr: HumanAddr | undefined,
  assets: terraswap.AssetInfo[],
  wasmClient: WasmClient,
): Promise<TerraBalancesWithTokenInfo> {
  const { balances } = await terraBalancesQuery(walletAddr, assets, wasmClient);

  const tokenInfos = await Promise.all(
    assets.map((asset) => {
      if ('native_token' in asset) {
        return Promise.resolve(nativeTokenInfoQuery(asset.native_token.denom));
      } else {
        return cw20TokenInfoQuery(asset.token.contract_addr, wasmClient).then(
          ({ tokenInfo }) => tokenInfo,
        );
      }
    }),
  );

  return {
    tokens: balances.map(({ balance, asset }, i) => {
      return {
        balance,
        asset,
        info: tokenInfos[i],
      };
    }),
  };
}
