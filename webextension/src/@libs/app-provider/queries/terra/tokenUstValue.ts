import { terraTokenUstValueQuery } from '@libs/app-fns';
import { createQueryFn } from '@libs/react-query-utils';
import { terraswap, Token, u, UST } from '@libs/types';
import { useQuery, UseQueryResult } from 'react-query';
import { useApp } from '../../contexts/app';
import { TERRA_QUERY_KEY } from '../../env';

const queryFn = createQueryFn(terraTokenUstValueQuery);

export function useTerraTokenUstValueQuery(
  asset: terraswap.AssetInfo,
  balance: u<Token>,
): UseQueryResult<u<UST>> {
  const { lcdQueryClient, queryErrorReporter, contractAddress } = useApp();

  return useQuery(
    [
      TERRA_QUERY_KEY.TERRA_TOKEN_UST_VALUE,
      asset,
      balance,
      contractAddress.terraswap.factory,
      lcdQueryClient,
    ],
    queryFn as any,
    {
      keepPreviousData: true,
      onError: queryErrorReporter,
    },
  );
}
