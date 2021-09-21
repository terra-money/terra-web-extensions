import { AppContractAddress, AppConstants } from '@libs/app-fns';
import { TERRA_QUERY_KEY, TERRA_TX_KEYS } from '@libs/app-provider';
import { Gas, HumanAddr, Rate } from '@libs/types';
import { NetworkInfo } from '@terra-dev/wallet-types';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';

export function appContractAddress(network: NetworkInfo): AppContractAddress {
  switch (network.chainID) {
    case 'columnbus-4':
      return {
        terraswap: {
          factory: 'terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj' as HumanAddr,
        },
      };
    default:
      return {
        terraswap: {
          factory: 'terra18qpjm4zkvqnpjpw0zn0tdr8gdzvt8au35v45xf' as HumanAddr,
        },
      };
  }
}

export function appConstants(network: NetworkInfo): AppConstants {
  switch (network.chainID) {
    case 'columnbus-4':
      return {
        gasWanted: 1_000_000 as Gas,
        fixedGas: 1_671_053 as Gas,
        blocksPerYear: 4_656_810,
        gasAdjustment: 1.6 as Rate<number>,
      };
    default:
      return {
        gasWanted: 1_000_000 as Gas,
        fixedGas: 1_671_053 as Gas,
        blocksPerYear: 4_656_810,
        gasAdjustment: 1.6 as Rate<number>,
      };
  }
}

export const APP_TX_REFETCH_MAP = {
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

export const DEFAULT_NETWORKS: WebExtensionNetworkInfo[] = [
  {
    name: 'mainnet',
    chainID: 'columbus-4',
    lcd: 'https://lcd.terra.dev',
  },
  {
    name: 'testnet',
    chainID: 'tequila-0004',
    lcd: 'https://tequila-lcd.terra.dev',
  },
];

export const txPortPrefix = 'tx-';
export const contentScriptPortPrefix = 'content-';

export const isTxPort = (name: string) => /^tx-[0-9]+$/.test(name);
export const isContentScriptPort = (name: string) =>
  /^content-[0-9]+$/.test(name);

export const getIdFromTxPort = (name: string) => name.substr(3);
export const getIdFromContentScriptPort = (name: string) => name.substr(8);

export const cardDesigns = [
  'anchor',
  'terra',
  '#147368',
  '#7e1d7b',
  '#113558',
  '#c35942',
];
