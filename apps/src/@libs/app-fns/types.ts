import { Gas, HumanAddr, Rate } from '@libs/types';

export interface AppContractAddress {
  terraswap: {
    factory: HumanAddr;
  };
}

export interface AppConstants {
  gasWanted: Gas;
  fixedGas: Gas;
  blocksPerYear: number;
  gasAdjustment: Rate<number>;
}
