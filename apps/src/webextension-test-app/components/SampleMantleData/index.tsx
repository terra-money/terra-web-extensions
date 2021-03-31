import {
  AnimateNumber,
  demicrofy,
  formatAUSTWithPostfixUnits,
  formatUSTWithPostfixUnits,
} from '@anchor-protocol/notation';
import { aUST, UST } from '@anchor-protocol/types';
import React from 'react';
import { useUserBalances } from './queries/userBalances';

export function SampleMantleData() {
  const {
    data: { uUSD, uaUST },
  } = useUserBalances();

  return (
    <ul>
      <li>
        UST:{' '}
        <AnimateNumber format={formatUSTWithPostfixUnits}>
          {uUSD ? demicrofy(uUSD) : (0 as UST<number>)}
        </AnimateNumber>
      </li>
      <li>
        aUST:{' '}
        <AnimateNumber format={formatAUSTWithPostfixUnits}>
          {uaUST ? demicrofy(uaUST) : (0 as aUST<number>)}
        </AnimateNumber>
      </li>
    </ul>
  );
}
