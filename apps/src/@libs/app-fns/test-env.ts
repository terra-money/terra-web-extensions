import {
  defaultHiveFetcher,
  defaultLcdFetcher,
  HiveWasmClient,
  LcdWasmClient,
} from '@libs/query-client';
import { HumanAddr } from '@libs/types';

export const TEST_HIVE_CLIENT: HiveWasmClient = {
  hiveEndpoint: 'https://tequila-mantle.anchorprotocol.com',
  hiveFetcher: defaultHiveFetcher,
};

export const TEST_LCD_CLIENT: LcdWasmClient = {
  lcdEndpoint: 'https://tequila-lcd.terra.dev',
  lcdFetcher: defaultLcdFetcher,
};

export const TEST_WALLET_ADDRESS =
  'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9' as HumanAddr;

export const TEST_CONTRACT_ADDRESS = {
  terraswap: {
    factory: 'terra18qpjm4zkvqnpjpw0zn0tdr8gdzvt8au35v45xf' as HumanAddr,
  },
};
