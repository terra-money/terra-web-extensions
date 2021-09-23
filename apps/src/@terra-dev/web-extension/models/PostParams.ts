import { CreateTxOptions } from '@terra-money/terra.js';

export interface PostParams {
  terraAddress: string;
  tx: CreateTxOptions;
}
