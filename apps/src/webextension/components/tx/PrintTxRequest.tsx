import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import styled from 'styled-components';

export interface PrintTxRequestProps {
  className?: string;
  network: WebConnectorNetworkInfo;
  tx: CreateTxOptions;
  hostname?: string;
  date: Date;
}

function Component({
  className,
  network,
  tx,
  hostname,
  date,
}: PrintTxRequestProps) {
  return (
    <ul className={className}>
      <li>
        <b>Network</b>
        <span>
          {network.name} ({network.chainID})
        </span>
      </li>
      {hostname && (
        <li>
          <b>Origin</b>
          <span>{hostname}</span>
        </li>
      )}
      <li>
        <b>Timestamp</b>
        <span>{date.toLocaleString()}</span>
      </li>
      <li>
        <b>Fee</b>
        <span>
          {tx.fee &&
            tx.fee.amount
              .toArray()
              .map(
                (coin) =>
                  coin.amount.div(1000000).toString() +
                  coin.denom.substr(1).toUpperCase(),
              )
              .join(', ')}
        </span>
      </li>
    </ul>
  );
}

const StyledComponent = styled(Component)`
  padding: 0;
  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 8px;

  color: var(--color-content-text);

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: 12px;
  }
`;

export const PrintTxRequest = fixHMR(StyledComponent);
