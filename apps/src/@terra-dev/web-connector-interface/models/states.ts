import { WebConnectorNetworkInfo } from './network';
import { WebConnectorWalletInfo } from './wallet';

export interface WebConnectorStates {
  focusedWalletAddress: string | undefined;
  wallets: WebConnectorWalletInfo[];
  network: WebConnectorNetworkInfo;
}
