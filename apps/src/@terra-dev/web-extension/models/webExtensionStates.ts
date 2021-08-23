import { WalletInfo } from '../models/wallet';
import { WebExtensionNetworkInfo } from './network';

export interface WebExtensionStates {
  focusedWalletAddress: string | undefined;
  wallets: WalletInfo[];
  network: WebExtensionNetworkInfo;
}
