import { createQueryFn } from '@libs/react-query-utils';
import { cw20, terraswap, Token } from '@libs/types';
import { TERRA_QUERY_KEY, terraTokenInfoQuery } from '@libs/webapp-fns';
import { useQuery, UseQueryResult } from 'react-query';
import { useTerraWebapp } from '../../contexts/context';

const queryFn = createQueryFn(terraTokenInfoQuery);

export function useTerraTokenInfo<T extends Token>(
  asset: terraswap.AssetInfo,
): UseQueryResult<cw20.TokenInfoResponse<T> | undefined> {
  const { mantleFetch, mantleEndpoint, queryErrorReporter } = useTerraWebapp();

  const result = useQuery(
    [TERRA_QUERY_KEY.TERRA_TOKEN_INFO, asset, mantleEndpoint, mantleFetch],
    queryFn as any,
    {
      keepPreviousData: true,
      onError: queryErrorReporter,
    },
  );

  return result as any;
}
