import {
  WasmClient,
  wasmFetch,
  WasmQuery,
  WasmQueryData,
} from '@libs/query-client';
import { HumanAddr, terraswap, Token } from '@libs/types';

export interface TerraswapSimulationWasmQuery {
  simulation: WasmQuery<
    terraswap.pair.Simulation<Token>,
    terraswap.pair.SimulationResponse<Token>
  >;
}

export type TerraswapSimulation = WasmQueryData<TerraswapSimulationWasmQuery>;

export async function terraswapSimulationQuery(
  ustPairAddr: HumanAddr,
  offerAssetQuery: terraswap.pair.Simulation<Token>['simulation']['offer_asset'],
  wasmClient: WasmClient,
): Promise<TerraswapSimulation> {
  const data = await wasmFetch<TerraswapSimulationWasmQuery>({
    ...wasmClient,
    wasmQuery: {
      simulation: {
        contractAddress: ustPairAddr,
        query: {
          simulation: {
            offer_asset: offerAssetQuery,
          },
        },
      },
    },
  });

  return data;
}
