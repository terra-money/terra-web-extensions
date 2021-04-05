import React, { SVGProps } from 'react';
import styled from 'styled-components';

export interface WalletBlankCardProps extends SVGProps<SVGSVGElement> {
  variant?: 'small' | 'medium';
  borderRadius?: number;
}

function WalletBlankCardBase({
  variant,
  borderRadius,
  children,
  ...svgProps
}: WalletBlankCardProps) {
  return (
    <svg viewBox="0 0 700 380" {...svgProps}>
      {children}
    </svg>
  );
}

export const WalletBlankCard = styled(WalletBlankCardBase)`
  border-radius: ${({
    variant = 'medium',
    borderRadius = variant === 'medium' ? 30 : 20,
  }) => borderRadius}px;

  background-color: #ffffff;
  border: 3px dashed #aaaaaa;

  svg {
    color: #aaaaaa;
  }
`;
