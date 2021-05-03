import { CreateTxOptions } from '@terra-money/terra.js';
import { Network } from './network';

export interface PostParams {
  terraAddress: string;
  network: Network;
  tx: CreateTxOptions;
}
