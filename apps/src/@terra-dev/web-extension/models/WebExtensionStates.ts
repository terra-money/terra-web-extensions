import { WebExtensionWalletInfo } from './WalletInfo';
import { WebExtensionNetworkInfo } from './WebExtensionNetworkInfo';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WebExtensionWalletInfo[];
  network: WebExtensionNetworkInfo;
}
