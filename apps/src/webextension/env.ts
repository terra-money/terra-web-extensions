import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';

export const defaultNetworks: WebExtensionNetworkInfo[] = [
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

export const width = 400;
// chrome extension maximum popup height = 600px
export const headerHeight = 50;
export const contentHeight = 550;
export const headerPadding = 20;

export const cardDesigns = [
  'anchor',
  'terra',
  '#147368',
  '#7e1d7b',
  '#113558',
  '#c35942',
];
