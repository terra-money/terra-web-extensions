import React, { SVGProps } from 'react';
import styled from 'styled-components';

export interface WalletCardContainerProps extends SVGProps<SVGSVGElement> {
  variant?: 'small' | 'medium';
  borderRadius?: number;
  textColor?: string;
}

function WalletCardContainerBase({
  variant = 'medium',
  borderRadius,
  textColor,
  ...svgProps
}: WalletCardContainerProps) {
  return <svg viewBox="0 0 700 380" {...svgProps} />;
}

export const WalletCardContainer = styled(WalletCardContainerBase)`
  box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.43);

  border-radius: ${({
    variant = 'medium',
    borderRadius = variant === 'medium' ? 30 : 20,
  }) => borderRadius}px;

  text {
    font-family: sans-serif;
    fill: ${({ textColor = '#ffffff' }) => textColor};
  }
`;
