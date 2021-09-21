import { hiveFetch } from './hive/client';
import { HiveFetcher } from './hive/fetch';
import { WasmFetchBaseParams, WasmQueryData } from './interface';
import { lcdFetch } from './lcd/client';
import { LcdFetcher } from './lcd/fetch';

export type LcdWasmClient = {
  lcdEndpoint: string;
  lcdFetcher: LcdFetcher;
  requestInit?: Omit<RequestInit, 'method' | 'body'>;
};

export type HiveWasmClient = {
  hiveEndpoint: string;
  hiveFetcher: HiveFetcher;
  requestInit?: Omit<RequestInit, 'method' | 'body'>;
};

export type WasmClient = LcdWasmClient | HiveWasmClient;

export type WasmFetchParams<WasmQueries> = WasmClient &
  WasmFetchBaseParams<WasmQueries>;

export async function wasmFetch<WasmQueries>(
  params: WasmFetchParams<WasmQueries>,
): Promise<WasmQueryData<WasmQueries>> {
  return 'lcdEndpoint' in params
    ? lcdFetch<WasmQueries>(params)
    : hiveFetch<WasmQueries>({ ...params, variables: {} });
}
