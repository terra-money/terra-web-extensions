import { ApolloQueryResult } from '@apollo/client';
import { map, Map } from '@terra-dev/use-map';
import { useCallback } from 'react';
import { MappedApolloQueryResult } from './types';

export function useRefetch<RawVariables, RawData, Data>(
  refetch: (
    variables?: Partial<RawVariables>,
  ) => Promise<ApolloQueryResult<RawData>>,
  dataMap: Map<RawData, Data>,
): (
  variables?: Partial<RawVariables>,
) => Promise<MappedApolloQueryResult<RawData, Data>> {
  return useCallback(
    (variables?: Partial<RawVariables>) => {
      return refetch(variables).then((result) => ({
        ...result,
        data: map(result.data, dataMap),
      }));
    },
    [dataMap, refetch],
  );
}
