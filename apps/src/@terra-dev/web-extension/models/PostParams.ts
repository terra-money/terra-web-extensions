import { CreateTxOptions } from '@terra-money/terra.js';
import { WebExtensionNetworkInfo } from './WebExtensionNetworkInfo';

export interface PostParams {
  terraAddress: string;
  network: WebExtensionNetworkInfo;
  tx: CreateTxOptions;
}
