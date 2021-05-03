import {
  AnimateNumber,
  demicrofy,
  formatANC,
  formatAUST,
  formatLuna,
  formatUST,
} from '@anchor-protocol/notation';
import { useWalletSelect } from '@terra-dev/web-extension-react';
import big from 'big.js';
import { useUserBalances } from 'common/queries/userBalances';
import React from 'react';

export function UserBalances() {
  const { selectedWallet } = useWalletSelect();

  const {
    data: { uUSD, uaUST, uLuna, ubLuna, uANC },
  } = useUserBalances({ selectedWallet });

  return (
    <>
      {uLuna && big(uLuna).gt(0) && (
        <li>
          <div>
            <i>
              <img
                src="https://assets.terra.money/icon/60/Luna.png"
                alt="Luna"
              />
            </i>
            <span>Luna</span>
          </div>
          <div>
            <AnimateNumber format={formatLuna}>
              {demicrofy(uLuna)}
            </AnimateNumber>
          </div>
        </li>
      )}
      {uUSD && big(uUSD).gt(0) && (
        <li>
          <div>
            <i>
              <img src="https://assets.terra.money/icon/60/UST.png" alt="UST" />
            </i>
            <span>UST</span>
          </div>
          <div>
            <AnimateNumber format={formatUST}>{demicrofy(uUSD)}</AnimateNumber>
          </div>
        </li>
      )}
      {uANC && big(uANC).gt(0) && (
        <li>
          <div>
            <i>
              <img
                src="https://whitelist.anchorprotocol.com/logo/ANC.png"
                alt="ANC"
              />
            </i>
            <span>ANC</span>
          </div>
          <div>
            <AnimateNumber format={formatANC}>{demicrofy(uANC)}</AnimateNumber>
          </div>
        </li>
      )}
      {ubLuna && big(ubLuna).gt(0) && (
        <li>
          <div>
            <i>
              <img
                src="https://whitelist.anchorprotocol.com/logo/bLUNA.png"
                alt="bLUNA"
              />
            </i>
            <span>bLUNA</span>
          </div>
          <div>
            <AnimateNumber format={formatLuna}>
              {demicrofy(ubLuna)}
            </AnimateNumber>
          </div>
        </li>
      )}
      {uaUST && big(uaUST).gt(0) && (
        <li>
          <div>
            <i>
              <img
                src="https://whitelist.anchorprotocol.com/logo/aUST.png"
                alt="aUST"
              />
            </i>
            <span>aUST</span>
          </div>
          <div>
            <AnimateNumber format={formatAUST}>
              {demicrofy(uaUST)}
            </AnimateNumber>
          </div>
        </li>
      )}
    </>
  );
}
