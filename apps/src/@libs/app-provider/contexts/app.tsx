import { GasPrice, lastSyncedHeightQuery } from '@libs/app-fns';
import { HiveWasmClient, LcdWasmClient, WasmClient } from '@libs/query-client';
import { useWallet } from '@terra-dev/use-wallet';
import { NetworkInfo } from '@terra-dev/wallet-types';
import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import {
  DEFAULT_FALLBACK_GAS_PRICE,
  DEFAULT_GAS_PRICE_ENDPOINTS,
  DEFAULT_HIVE_WASM_CLIENT,
  DEFAULT_LCD_WASM_CLIENT,
} from '../env';
import { useGasPriceQuery } from '../queries/gasPrice';
import { AppConstants, AppContractAddress, TxRefetchMap } from '../types';

export interface AppProviderProps<
  ContractAddress extends AppContractAddress,
  Constants extends AppConstants,
> {
  children: ReactNode;

  contractAddress: (network: NetworkInfo) => ContractAddress;
  constants: (network: NetworkInfo) => Constants;

  defaultWasmClient?:
    | 'lcd'
    | 'hive'
    | ((network: NetworkInfo) => 'lcd' | 'hive');
  lcdWasmClient?: (network: NetworkInfo) => LcdWasmClient;
  hiveWasmClient?: (network: NetworkInfo) => HiveWasmClient;

  // gas
  gasPriceEndpoint?: (network: NetworkInfo) => string;
  fallbackGasPrice?: (network: NetworkInfo) => GasPrice;

  // refetch map
  refetchMap: TxRefetchMap;

  // sentry captureException()
  txErrorReporter?: (error: unknown) => string;

  // sentry captureException()
  queryErrorReporter?: (error: unknown) => void;
}

export interface App<
  ContractAddress extends AppContractAddress,
  Constants extends AppConstants,
> {
  contractAddress: ContractAddress;
  constants: Constants;

  // functions
  lastSyncedHeight: () => Promise<number>;

  // wasm
  wasmClient: WasmClient;
  lcdWasmClient: LcdWasmClient;
  hiveWasmClient: HiveWasmClient;

  // gas
  gasPrice: GasPrice;

  // refetch map
  refetchMap: TxRefetchMap;

  // sentry captureException()
  txErrorReporter?: (error: unknown) => string;

  // sentry captureException()
  queryErrorReporter?: (error: unknown) => void;
}

//@ts-ignore
const AppContext: Context<App<any, any>> = createContext<App<any, any>>();

export function AppProvider<
  ContractAddress extends AppContractAddress,
  Constants extends AppConstants,
>({
  children,
  contractAddress,
  constants,
  defaultWasmClient = 'hive',
  lcdWasmClient: _lcdWasmClient = DEFAULT_LCD_WASM_CLIENT,
  hiveWasmClient: _hiveWasmClient = DEFAULT_HIVE_WASM_CLIENT,
  gasPriceEndpoint = DEFAULT_GAS_PRICE_ENDPOINTS,
  fallbackGasPrice = DEFAULT_FALLBACK_GAS_PRICE,
  queryErrorReporter,
  txErrorReporter,
  refetchMap,
}: AppProviderProps<ContractAddress, Constants>) {
  const { network } = useWallet();

  const networkBoundStates = useMemo<
    Pick<
      App<any, any>,
      | 'contractAddress'
      | 'constants'
      | 'wasmClient'
      | 'lcdWasmClient'
      | 'hiveWasmClient'
    >
  >(() => {
    const lcdWasmClient = _lcdWasmClient(network);
    const hiveWasmClient = _hiveWasmClient(network);
    const wasmClientType =
      typeof defaultWasmClient === 'function'
        ? defaultWasmClient(network)
        : defaultWasmClient;
    const wasmClient =
      wasmClientType === 'lcd' ? lcdWasmClient : hiveWasmClient;

    return {
      contractAddress: contractAddress(network),
      constants: constants(network),
      wasmClient,
      lcdWasmClient,
      hiveWasmClient,
    };
  }, [
    _hiveWasmClient,
    _lcdWasmClient,
    constants,
    contractAddress,
    defaultWasmClient,
    network,
  ]);

  const lastSyncedHeight = useMemo(() => {
    return () => lastSyncedHeightQuery(networkBoundStates.wasmClient);
  }, [networkBoundStates.wasmClient]);

  const {
    data: gasPrice = fallbackGasPrice(network) ?? fallbackGasPrice(network),
  } = useGasPriceQuery(
    gasPriceEndpoint(network) ?? gasPriceEndpoint(network),
    queryErrorReporter,
  );

  const states = useMemo<App<any, any>>(() => {
    return {
      ...networkBoundStates,
      lastSyncedHeight,
      txErrorReporter,
      queryErrorReporter,
      gasPrice,
      refetchMap,
    };
  }, [
    gasPrice,
    lastSyncedHeight,
    networkBoundStates,
    queryErrorReporter,
    refetchMap,
    txErrorReporter,
  ]);

  return <AppContext.Provider value={states}>{children}</AppContext.Provider>;
}

export function useApp<
  ContractAddress extends AppContractAddress = AppContractAddress,
  Constants extends AppConstants = AppConstants,
>(): App<ContractAddress, Constants> {
  return useContext(AppContext);
}

export const AppConsumer: Consumer<App<any, any>> = AppContext.Consumer;
