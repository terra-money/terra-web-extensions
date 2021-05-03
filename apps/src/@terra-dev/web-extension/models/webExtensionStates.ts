import { WalletInfo } from '@terra-dev/wallet';
import { WebExtensionNetworkInfo } from './network';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WalletInfo[];
  network: WebExtensionNetworkInfo;
}
