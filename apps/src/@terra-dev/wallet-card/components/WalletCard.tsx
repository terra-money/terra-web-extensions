import { truncate } from '@anchor-protocol/notation';
import React, { ReactNode, SVGProps } from 'react';
import styled from 'styled-components';
import { ReactComponent as Terra } from '../designs/terra.svg';

export interface WalletCardProps extends SVGProps<SVGSVGElement> {
  name: string;
  terraAddress: string;
  design?: ReactNode;
  variant?: 'small' | 'medium';
  borderRadius?: number;
}

function WalletCardBase({
  design,
  name,
  terraAddress,
  variant = 'medium',
  borderRadius,
  ...svgProps
}: WalletCardProps) {
  return (
    <svg viewBox="0 0 700 380" {...svgProps}>
      {design ?? <Terra />}
      {variant === 'medium' && (
        <>
          <text x={60} y={250} fontSize={23} opacity={0.7}>
            {terraAddress}
          </text>
          <text x={60} y={300} fontSize={35}>
            {name}
          </text>
        </>
      )}
      {variant === 'small' && (
        <>
          <text x={60} y={220} fontSize={40} opacity={0.7}>
            {truncate(terraAddress)}
          </text>
          <text x={60} y={300} fontSize={60}>
            {name}
          </text>
        </>
      )}
    </svg>
  );
}

export const WalletCard = styled(WalletCardBase)`
  box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.43);

  border-radius: ${({
    variant = 'medium',
    borderRadius = variant === 'medium' ? 30 : 20,
  }) => borderRadius}px;

  text {
    font-family: sans-serif;
    fill: #ffffff;
  }
`;
