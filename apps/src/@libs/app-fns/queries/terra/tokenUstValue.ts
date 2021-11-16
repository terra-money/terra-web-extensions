import { LcdQueryClient } from '@libs/query-client';
import { HumanAddr, NativeDenom, terraswap, Token, u, UST } from '@libs/types';
import big, { Big } from 'big.js';
import { cw20PoolInfoQuery } from '../cw20/poolInfo';

export async function terraTokenUstValueQuery(
  asset: terraswap.AssetInfo,
  balance: u<Token>,
  terraswapFactoryAddr: HumanAddr,
  lcdClient: LcdQueryClient,
): Promise<u<UST> | undefined> {
  if ('native_token' in asset) {
    if (asset.native_token.denom === 'uusd') {
      return balance as u<UST>;
    }

    const exchangeRates = await lcdClient
      .lcdFetcher<{
        exchange_rates: { denom: NativeDenom; amount: u<Token> }[];
      }>(
        `${lcdClient.lcdEndpoint}/terra/oracle/v1beta1/denoms/exchange_rates`,
        lcdClient.requestInit,
      )
      .then(({ exchange_rates }) => exchange_rates);

    const ustExchangeRate = exchangeRates.find(({ denom }) => denom === 'uusd');

    if (ustExchangeRate && asset.native_token.denom === 'uluna') {
      return big(balance).mul(ustExchangeRate.amount).toFixed() as u<UST>;
    }

    const assetExchangeRate = exchangeRates.find(
      ({ denom }) => denom === asset.native_token.denom,
    );

    if (assetExchangeRate && ustExchangeRate) {
      const price: UST<Big> = big(assetExchangeRate.amount).div(
        ustExchangeRate.amount,
      ) as UST<Big>;
      return big(balance).mul(price).toFixed() as u<UST>;
    } else {
      throw new Error(
        `Can't find exchange_rate of "${asset.native_token.denom}"`,
      );
    }
  } else {
    const { terraswapPoolInfo } = await cw20PoolInfoQuery(
      asset.token.contract_addr,
      terraswapFactoryAddr,
      lcdClient,
    );
    return terraswapPoolInfo
      ? (big(balance).mul(terraswapPoolInfo.tokenPrice).toFixed() as u<UST>)
      : undefined;
  }
}
