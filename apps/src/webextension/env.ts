import {
  AppConstants,
  AppContractAddress,
  TERRA_QUERY_KEY,
  TERRA_TX_KEYS,
} from '@libs/app-provider';
import type { Gas, HumanAddr, Rate } from '@libs/types';
import type { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import type { NetworkInfo } from '@terra-money/use-wallet';

export const WHITELIST_HOSTNAMES = [
  'station.terra.money',
  'app.anchorprotocol.com',
];

export function STATION_CONTRACT_ADDRESS(
  network: NetworkInfo,
): AppContractAddress {
  if (network.chainID.startsWith('columbus')) {
    return {
      terraswap: {
        factory: 'terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj' as HumanAddr,
      },
    };
  } else {
    return {
      terraswap: {
        factory: 'terra18qpjm4zkvqnpjpw0zn0tdr8gdzvt8au35v45xf' as HumanAddr,
      },
    };
  }
}

export function STATION_CONSTANTS(network: NetworkInfo): AppConstants {
  return {
    gasWanted: 1_000_000 as Gas,
    fixedGas: 1_671_053 as Gas,
    blocksPerYear: 4_656_810,
    gasAdjustment: 1.6 as Rate<number>,
  };
}

export const STATION_TX_REFETCH_MAP = {
  [TERRA_TX_KEYS.CW20_BUY]: [
    TERRA_QUERY_KEY.TOKEN_BALANCES,
    TERRA_QUERY_KEY.CW20_BALANCE,
    TERRA_QUERY_KEY.TERRA_BALANCES,
  ],
  [TERRA_TX_KEYS.CW20_SELL]: [
    TERRA_QUERY_KEY.TOKEN_BALANCES,
    TERRA_QUERY_KEY.CW20_BALANCE,
    TERRA_QUERY_KEY.TERRA_BALANCES,
  ],
  [TERRA_TX_KEYS.SEND]: [
    TERRA_QUERY_KEY.TOKEN_BALANCES,
    TERRA_QUERY_KEY.CW20_BALANCE,
    TERRA_QUERY_KEY.TERRA_BALANCES,
  ],
};

export const FALLBACK_NETWORKS: WebConnectorNetworkInfo[] = [
  {
    name: 'mainnet',
    chainID: 'columbus-5',
    lcd: 'https://lcd.terra.dev',
  },
  {
    name: 'testnet',
    chainID: 'bombay-12',
    lcd: 'https://bombay-lcd.terra.dev',
  },
];

export const TX_PORT_PREFIX = 'tx-';
export const CONTENT_SCRIPT_PORT_PREFIX = 'content-';
export const TX_INFO_PORT_PREFIX = 'txinfo-';

export const isTxPort = (name: string) => /^tx-[0-9]+$/.test(name);
export const isContentScriptPort = (name: string) =>
  /^content-[0-9]+$/.test(name);
export const isTxInfoPort = (name: string) => /^txinfo-[0-9]+$/.test(name);

export const getIdFromTxPort = (name: string) => name.substr(3);
export const getIdFromContentScriptPort = (name: string) => name.substr(8);

export const cardDesigns = [
  'terra',
  'anchor',
  'mirror',
  '#00a9b4',
  '#00ae69',
  '#6c19fe',
  '#f55275',
  '#fea00d',
];
