import { formatUToken } from '@libs/formatter';
import { Token, u } from '@libs/types';
import { TimeDistance } from '@station/ui';
import { WalletNetworkInfo } from '@terra-dev/wallet-interface';
import { Coins, CreateTxOptions } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import styled from 'styled-components';

export interface PrintTxRequestProps {
  className?: string;
  isEstimatedFee: boolean;
  network: WalletNetworkInfo;
  tx: CreateTxOptions;
  hostname?: string;
  date: Date;
}

function Component({
  className,
  isEstimatedFee,
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
        <span>
          <TimeDistance date={date} />
        </span>
      </li>
      {tx.fee && (
        <li>
          <b>{isEstimatedFee ? 'Estimated Fee' : 'Fee'}</b>
          <span>
            <PrintCoins coins={tx.fee.amount} />
          </span>
        </li>
      )}
    </ul>
  );
}

function PrintCoins({ coins }: { coins: Coins }) {
  return (
    <>
      {coins.toArray().map((coin, i) => {
        return (
          <span key={'coin' + i}>
            {i !== 0 ? ' + ' : ''}
            {formatUToken(coin.amount.toString() as u<Token>)}{' '}
            <span style={{ fontSize: '0.8em' }}>
              {coin.denom.substr(1).toUpperCase()}
            </span>
          </span>
        );
      })}
    </>
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
