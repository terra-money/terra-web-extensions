import { WebConnectorNetworkInfo } from './WebConnectorNetworkInfo';
import { WebConnectorWalletInfo } from './WebConnectorWalletInfo';

export interface WebConnectorStates {
  focusedWalletAddress: string | undefined;
  wallets: WebConnectorWalletInfo[];
  network: WebConnectorNetworkInfo;
}
