import { WalletInfo } from './WalletInfo';
import { WebExtensionNetworkInfo } from './WebExtensionNetworkInfo';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WalletInfo[];
  network: WebExtensionNetworkInfo;
}
