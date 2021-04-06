import { Network } from '@terra-dev/network';

export const defaultNetworks: Network[] = [
  {
    name: 'mainnet',
    chainID: 'columbus-4',
    servers: {
      lcd: 'https://lcd.terra.dev',
      fcd: 'https://fcd.terra.dev',
      ws: 'wss://fcd.terra.dev',
      mantle: 'https://mantle.anchorprotocol.com/',
    },
  },
  {
    name: 'testnet',
    chainID: 'tequila-0004',
    servers: {
      lcd: 'https://tequila-lcd.terra.dev',
      fcd: 'https://tequila-fcd.terra.dev',
      ws: 'wss://tequila-ws.terra.dev',
      mantle: 'https://tequila-mantle.anchorprotocol.com/',
    },
  },
];

export const txPortPrefix = 'tx-';
export const contentScriptPortPrefix = 'content-';

export const isTxPort = (name: string) => /^tx-[0-9]+$/.test(name);
export const isContentScriptPort = (name: string) =>
  /^content-[0-9]+$/.test(name);

export const getIdFromTxPort = (name: string) => name.substr(3);
export const getIdFromContentScriptPort = (name: string) => name.substr(8);

export const width = 400;
export const headerHeight = 50;
export const contentHeight = 600;
export const headerPadding = 20;

export const cardDesigns = [
  'anchor',
  'terra',
  '#147368',
  '#7e1d7b',
  '#113558',
  '#c35942',
];
