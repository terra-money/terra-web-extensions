import { truncate } from '@anchor-protocol/notation';
import { WalletCardContainerProps } from './WalletCardContainer';
import React from 'react';

export interface WalletCardTextsProps
  extends Pick<WalletCardContainerProps, 'variant'> {
  name: string;
  terraAddress: string;
}

export function WalletCardTexts({
  name,
  terraAddress,
  variant,
}: WalletCardTextsProps) {
  return variant === 'medium' ? (
    <>
      <text x={60} y={250} fontSize={23} opacity={0.7}>
        {terraAddress}
      </text>
      <text x={60} y={300} fontSize={35}>
        {name}
      </text>
    </>
  ) : (
    <>
      <text x={60} y={220} fontSize={40} opacity={0.7}>
        {truncate(terraAddress)}
      </text>
      <text x={60} y={300} fontSize={60}>
        {name}
      </text>
    </>
  );
}
