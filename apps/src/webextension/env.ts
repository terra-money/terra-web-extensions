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
