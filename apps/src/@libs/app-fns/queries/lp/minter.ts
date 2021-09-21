import {
  WasmClient,
  wasmFetch,
  WasmQuery,
  WasmQueryData,
} from '@libs/query-client';
import { lp, LPAddr } from '@libs/types';

interface LpMinterWasmQuery {
  minter: WasmQuery<lp.Minter, lp.MinterResponse>;
}

export type LpMinter = WasmQueryData<LpMinterWasmQuery>;

export async function lpMinterQuery(
  lpTokenAddr: LPAddr,
  wasmClient: WasmClient,
): Promise<LpMinter> {
  return wasmFetch<LpMinterWasmQuery>({
    ...wasmClient,
    id: `lp--minter=${lpTokenAddr}`,
    wasmQuery: {
      minter: {
        contractAddress: lpTokenAddr,
        query: {
          minter: {},
        },
      },
    },
  });
}
