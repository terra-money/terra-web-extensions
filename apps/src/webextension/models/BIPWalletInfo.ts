import { NativeBalances } from '@libs/app-fns';
import { BIPCoinType } from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';

export interface BIPWalletInfo {
  coinType: BIPCoinType;
  mk: MnemonicKey;
  balances: NativeBalances;
}
