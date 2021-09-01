import { LinedList } from '@libs/station-ui/components/LinedList';
import {
  Money,
  MyLocationOutlined,
  Schedule,
  WifiTethering,
} from '@material-ui/icons';
import { deserializeTx } from '@terra-dev/web-extension';
import { TxRequest } from '@terra-dev/web-extension-backend';
import { StdFee } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

export interface TxRequestDetailProps {
  className?: string;
  txRequest: TxRequest;
}

function TxRequestDetailBase({ className, txRequest }: TxRequestDetailProps) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  const [fee] = useState<StdFee | undefined>(() => tx.fee);

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
          {txRequest.network.name} ({txRequest.network.chainID})
        </span>
      </li>
      <li>
        <div>
          <i>
            <MyLocationOutlined />
          </i>
          <span>ORIGIN</span>
        </div>
        <span>{txRequest.hostname}</span>
      </li>
      <li>
        <div>
          <i>
            <Schedule />
          </i>
          <span>TIMESTAMP</span>
        </div>
        <span>{txRequest.date.toLocaleString()}</span>
      </li>
      <li>
        <div>
          <i>
            <Money />
          </i>
          <span>FEE</span>
        </div>
        <span>
          {fee &&
            fee.amount
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

export const StyledTxRequestDetail = styled(TxRequestDetailBase)`
  // TODO
`;

export const TxRequestDetail = fixHMR(StyledTxRequestDetail);
