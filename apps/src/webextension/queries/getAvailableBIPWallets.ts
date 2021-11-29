import { NativeBalances, terraNativeBalancesQuery } from '@libs/app-fns';
import { defaultLcdFetcher, LcdQueryClient } from '@libs/query-client';
import { HumanAddr } from '@libs/types';
import {
  BIPCoinType,
  restoreMnemonicKey,
} from '@terra-dev/web-extension-backend';
import big from 'big.js';
import { BIPWalletInfo } from '../models/BIPWalletInfo';

export async function getAvailableBIPWallets(
  mnemonic: string,
  addressIndex: number = 0,
): Promise<BIPWalletInfo[]> {
  const queryClient: LcdQueryClient = {
    lcdEndpoint: 'https://lcd.terra.dev',
    lcdFetcher: defaultLcdFetcher,
  };

  const mk118 = restoreMnemonicKey(mnemonic, BIPCoinType.ATOM, addressIndex);
  const mk330 = restoreMnemonicKey(mnemonic, BIPCoinType.LUNA, addressIndex);

  const [balances118, balances330] = await Promise.all([
    terraNativeBalancesQuery(mk118.accAddress as HumanAddr, queryClient),
    terraNativeBalancesQuery(mk330.accAddress as HumanAddr, queryClient),
  ]);

  let has118Balance = false;
  const keys = Object.keys(balances118) as (keyof NativeBalances)[];

  for (const key of keys) {
    if (big(balances118[key]).gt(0)) {
      has118Balance = true;
      break;
    }
  }

  return has118Balance
    ? [
        {
          coinType: BIPCoinType.ATOM,
          mk: mk118,
          balances: balances118,
        },
        {
          coinType: BIPCoinType.LUNA,
          mk: mk330,
          balances: balances330,
        },
      ]
    : [{ coinType: BIPCoinType.LUNA, mk: mk330, balances: balances330 }];
}
