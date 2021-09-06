import { LinedList } from '@station/ui';
import {
  Money,
  MyLocationOutlined,
  Schedule,
  WifiTethering,
} from '@material-ui/icons';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import { CreateTxOptions } from '@terra-money/terra.js';
import React from 'react';

export interface PrintTxRequestProps {
  className?: string;
  network: WebExtensionNetworkInfo;
  tx: CreateTxOptions;
  hostname: string;
  date: Date;
}

export function PrintTxRequest({
  className,
  network,
  tx,
  hostname,
  date,
}: PrintTxRequestProps) {
  return (
    <LinedList
      className={className}
      iconMarginRight="0.6em"
      firstLetterUpperCase={false}
    >
      <li>
        <div>
          <i>
            <WifiTethering />
          </i>
          <span>NETWORK</span>
        </div>
        <span>
          {network.name} ({network.chainID})
        </span>
      </li>
      <li>
        <div>
          <i>
            <MyLocationOutlined />
          </i>
          <span>ORIGIN</span>
        </div>
        <span>{hostname}</span>
      </li>
      <li>
        <div>
          <i>
            <Schedule />
          </i>
          <span>TIMESTAMP</span>
        </div>
        <span>{date.toLocaleString()}</span>
      </li>
      <li>
        <div>
          <i>
            <Money />
          </i>
          <span>FEE</span>
        </div>
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
    </LinedList>
  );
}
