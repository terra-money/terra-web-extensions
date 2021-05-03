import { WalletInfo } from '@terra-dev/wallet';
import { Network } from './network';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WalletInfo[];
  network: Network;
}
