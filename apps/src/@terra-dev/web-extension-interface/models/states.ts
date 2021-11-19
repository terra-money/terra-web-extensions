import type { WebExtensionNetworkInfo } from './network';
import type { WebExtensionWalletInfo } from './wallet';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WebExtensionWalletInfo[];
  network: WebExtensionNetworkInfo;
}
