import {
  EMPTY_NATIVE_BALANCES,
  NativeBalances,
  pickNativeBalance,
  terraNativeBalancesQuery,
} from '@libs/app-fns';
import { createQueryFn } from '@libs/react-query-utils';
import { HumanAddr, NativeDenom, terraswap, Token, u, UST } from '@libs/types';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import { useMemo } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { useApp } from '../../contexts/app';
import { TERRA_QUERY_KEY } from '../../env';

const queryFn = createQueryFn(terraNativeBalancesQuery);

export function useTerraNativeBalancesQuery(
  walletAddr?: HumanAddr,
): UseQueryResult<NativeBalances | undefined> {
  const { queryClient, queryErrorReporter } = useApp();

  const connectedWallet = useConnectedWallet();

  const result = useQuery(
    [
      TERRA_QUERY_KEY.TERRA_NATIVE_BALANCES,
      walletAddr ?? connectedWallet?.walletAddress,
      queryClient,
    ],
    queryFn,
    {
      refetchInterval: !!connectedWallet && 1000 * 60 * 5,
      keepPreviousData: true,
      onError: queryErrorReporter,
      placeholderData: () => EMPTY_NATIVE_BALANCES,
    },
  );

  return result;
}

export function useTerraNativeBalances(walletAddr?: HumanAddr): NativeBalances {
  const { data: nativeBalances = EMPTY_NATIVE_BALANCES } =
    useTerraNativeBalancesQuery(walletAddr);

  return nativeBalances;
}

export function useTerraNativeBalancesWithAssetInfo(
  walletAddr?: HumanAddr,
): terraswap.NativeAsset<Token>[] {
  const { data: nativeBalances = EMPTY_NATIVE_BALANCES } =
    useTerraNativeBalancesQuery(walletAddr);

  return useMemo(() => {
    return [
      {
        amount: nativeBalances.uUST,
        info: { native_token: { denom: 'uusd' } },
      },
      {
        amount: nativeBalances.uLuna,
        info: { native_token: { denom: 'uluna' } },
      },
      {
        amount: nativeBalances.uAUD,
        info: { native_token: { denom: 'uaud' } },
      },
      {
        amount: nativeBalances.uCAD,
        info: { native_token: { denom: 'ucad' } },
      },
      {
        amount: nativeBalances.uCHF,
        info: { native_token: { denom: 'uchf' } },
      },
      {
        amount: nativeBalances.uCNY,
        info: { native_token: { denom: 'ucny' } },
      },
      {
        amount: nativeBalances.uDKK,
        info: { native_token: { denom: 'udkk' } },
      },
      {
        amount: nativeBalances.uEUR,
        info: { native_token: { denom: 'ueur' } },
      },
      {
        amount: nativeBalances.uGBP,
        info: { native_token: { denom: 'ugbp' } },
      },
      {
        amount: nativeBalances.uHKD,
        info: { native_token: { denom: 'uhkd' } },
      },
      {
        amount: nativeBalances.uIDR,
        info: { native_token: { denom: 'uidr' } },
      },
      {
        amount: nativeBalances.uINR,
        info: { native_token: { denom: 'uinr' } },
      },
      {
        amount: nativeBalances.uJPY,
        info: { native_token: { denom: 'ujpy' } },
      },
      {
        amount: nativeBalances.uKRW,
        info: { native_token: { denom: 'ukrw' } },
      },
      {
        amount: nativeBalances.uMNT,
        info: { native_token: { denom: 'umnt' } },
      },
      {
        amount: nativeBalances.uNOK,
        info: { native_token: { denom: 'unok' } },
      },
      {
        amount: nativeBalances.uPHP,
        info: { native_token: { denom: 'uphp' } },
      },
      {
        amount: nativeBalances.uSDR,
        info: { native_token: { denom: 'usdr' } },
      },
      {
        amount: nativeBalances.uSEK,
        info: { native_token: { denom: 'usek' } },
      },
      {
        amount: nativeBalances.uSGD,
        info: { native_token: { denom: 'usgd' } },
      },
      {
        amount: nativeBalances.uTHB,
        info: { native_token: { denom: 'uthb' } },
      },
      {
        amount: nativeBalances.uKRT,
        info: { native_token: { denom: 'ukrt' } },
      },
    ];
  }, [
    nativeBalances.uAUD,
    nativeBalances.uCAD,
    nativeBalances.uCHF,
    nativeBalances.uCNY,
    nativeBalances.uDKK,
    nativeBalances.uEUR,
    nativeBalances.uGBP,
    nativeBalances.uHKD,
    nativeBalances.uIDR,
    nativeBalances.uINR,
    nativeBalances.uJPY,
    nativeBalances.uKRT,
    nativeBalances.uKRW,
    nativeBalances.uLuna,
    nativeBalances.uMNT,
    nativeBalances.uNOK,
    nativeBalances.uPHP,
    nativeBalances.uSDR,
    nativeBalances.uSEK,
    nativeBalances.uSGD,
    nativeBalances.uTHB,
    nativeBalances.uUST,
  ]);
}

export function useTerraNativeBalanceQuery<T extends Token>(
  denom: NativeDenom,
  walletAddr?: HumanAddr,
): u<T> {
  const { data: nativeBalances = EMPTY_NATIVE_BALANCES } =
    useTerraNativeBalancesQuery(walletAddr);

  return useMemo<u<T>>(() => {
    return pickNativeBalance(denom, nativeBalances);
  }, [denom, nativeBalances]);
}

export function useUstBalance(walletAddr?: HumanAddr | undefined): u<UST> {
  return useTerraNativeBalanceQuery<UST>('uusd', walletAddr);
}
