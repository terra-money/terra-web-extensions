import { truncate } from '@libs/formatter';
import React, { SVGProps, useMemo } from 'react';
import { WalletCardContainerProps } from './WalletCardContainer';

export interface WalletCardTextsProps
  extends Pick<WalletCardContainerProps, 'variant'> {
  name: string;
  terraAddress: string;
  onAddressClick?: () => void;
}

export function WalletCardTexts({
  name,
  terraAddress,
  variant,
  onAddressClick,
}: WalletCardTextsProps) {
  const addressProps = useMemo<SVGProps<SVGTextElement>>(() => {
    return {
      onClick: onAddressClick,
      style: { cursor: !!onAddressClick ? 'pointer' : undefined },
    };
  }, [onAddressClick]);

  return variant === 'medium' ? (
    <>
      <text x={60} y={250} fontSize={23} opacity={0.7} {...addressProps}>
        {terraAddress}
      </text>
      <text x={60} y={300} fontSize={35}>
        {name}
      </text>
    </>
  ) : (
    <>
      <text x={60} y={220} fontSize={40} opacity={0.7} {...addressProps}>
        {truncate(terraAddress)}
      </text>
      <text x={60} y={300} fontSize={60}>
        {name}
      </text>
    </>
  );
}
