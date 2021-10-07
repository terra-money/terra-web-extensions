import { GasPrice } from '@libs/app-fns';
import {
  defaultHiveFetcher,
  defaultLcdFetcher,
  HiveQueryClient,
  LcdQueryClient,
} from '@libs/query-client';
import { NetworkInfo } from '@terra-dev/wallet-types';
import { UseQueryResult } from 'react-query';

export function DEFAULT_HIVE_WASM_CLIENT(
  network: NetworkInfo,
): HiveQueryClient {
  if (network.chainID.startsWith('bombay')) {
    return {
      hiveEndpoint: 'https://bombay-mantle.terra.dev',
      hiveFetcher: defaultHiveFetcher,
    };
  } else {
    return {
      hiveEndpoint: 'https://mantle.terra.dev',
      hiveFetcher: defaultHiveFetcher,
    };
  }
}

export function DEFAULT_LCD_WASM_CLIENT(network: NetworkInfo): LcdQueryClient {
  return {
    lcdEndpoint: network.lcd,
    lcdFetcher: defaultLcdFetcher,
  };
}

export function DEFAULT_GAS_PRICE_ENDPOINTS(network: NetworkInfo): string {
  const fcd = network.lcd.replace(/lcd/, 'fcd');
  return `${fcd}/v1/txs/gas_prices`;
}

const FALLBACK_GAS_PRICE_COLUMNBUS = {
  uluna: '0.013199',
  uaud: '0.527101',
  ucad: '0.481912',
  uchf: '0.347244',
  ucny: '2.455638',
  udkk: '2.402775',
  ueur: '0.323109',
  ugbp: '0.276745',
  uhkd: '2.950842',
  uidr: '5450.0',
  uinr: '28.085651',
  ujpy: '41.68797',
  ukrw: '443.515327',
  umnt: '1061.675585',
  unok: '3.314161',
  uphp: '19.0',
  usdr: '0.267408',
  usek: '3.314161',
  usgd: '0.514572',
  uthb: '12.581803',
  uusd: '0.456',
};

const FALLBACK_GAS_PRICE_BOMBAY = {
  ...FALLBACK_GAS_PRICE_COLUMNBUS,
  uluna: '0.15',
  usdr: '0.1018',
  uusd: '0.15',
  ukrw: '178.05',
  umnt: '431.6259',
  ueur: '0.125',
  ucny: '0.97',
  ujpy: '16',
  ugbp: '0.11',
  uinr: '11',
  ucad: '0.19',
  uchf: '0.13',
  uaud: '0.19',
  usgd: '0.2',
  uthb: '4.62',
  usek: '1.25',
  unok: '1.25',
  udkk: '0.9',
};

export function DEFAULT_FALLBACK_GAS_PRICE(network: NetworkInfo): GasPrice {
  if (network.chainID.startsWith('bombay')) {
    return FALLBACK_GAS_PRICE_BOMBAY as GasPrice;
  } else {
    return FALLBACK_GAS_PRICE_COLUMNBUS as GasPrice;
  }
}

export const EMPTY_QUERY_RESULT: UseQueryResult<undefined> = {
  data: undefined,
  dataUpdatedAt: 0,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  isError: false,
  isFetched: false,
  isFetchedAfterMount: false,
  isIdle: false,
  isLoading: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isFetching: false,
  isRefetchError: false,
  isSuccess: true,
  isStale: false,
  status: 'success',
  remove: () => {},
  refetch: () => Promise.resolve(EMPTY_QUERY_RESULT),
};

export enum TERRA_TX_KEYS {
  CW20_BUY = 'NEBULA_TX_CW20_BUY',
  CW20_SELL = 'NEBULA_TX_CW20_SELL',
  SEND = 'NEBULA_TX_SEND',
}

export enum TERRA_QUERY_KEY {
  TOKEN_BALANCES = 'TERRA_QUERY_TOKEN_BALANCES',
  CW20_BALANCE = 'TERRA_QUERY_CW20_BALANCE',
  CW20_ICONS = 'TERRA_QUERY_CW20_ICONS',
  CW20_TOKEN_INFO = 'NEBULA_QUERY_CW20_TOKEN_INFO',
  STAKING_POOL_INFO = 'NEBULA_QUERY_STAKING_CLUSTER_POOL_INFO_LIST',
  TERRASWAP_PAIR = 'NEBULA_QUERY_TERRASWAP_PAIR',
  TERRASWAP_POOL = 'NEBULA_QUERY_TERRASWAP_POOL',
  TERRA_BALANCES = 'NEBULA_QUERY_TERRA_BALANCES',
  TERRA_BALANCES_WITH_TOKEN_INFO = 'NEBULA_QUERY_TERRA_BALANCES_WITH_TOKEN_INFO',
  TERRA_NATIVE_BALANCES = 'NEBULA_QUERY_TERRA_NATIVE_BALANCES',
  TERRA_TOKEN_INFO = 'NEBULA_QUERY_TERRA_TOKEN_INFO',
  TERRA_TREASURY_TAX_CAP = 'TERRA_QUERY_TERRA_TREASURY_TAX_CAP',
  TERRA_TREASURY_TAX_RATE = 'TERRA_QUERY_TERRA_TREASURY_TAX_RATE',
  TERRA_GAS_PRICE = 'TERRA_QUERY_GAS_PRICE',
}
