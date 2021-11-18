import { WalletNetworkInfo } from './network';
import { WalletInfo } from './wallet';

export interface WalletStates {
  focusedWalletAddress: string | undefined;
  wallets: WalletInfo[];
  network: WalletNetworkInfo;
}
