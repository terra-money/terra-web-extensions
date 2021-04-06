import { cardHeight, cardWidth } from '../env';
import React, { isValidElement, ReactNode, useMemo } from 'react';
import {
  WalletCardContainer,
  WalletCardContainerProps,
} from './WalletCardContainer';
import { WalletCardTexts, WalletCardTextsProps } from './WalletCardTexts';

export interface WalletCardProps
  extends Omit<WalletCardContainerProps, 'name'>,
    WalletCardTextsProps {
  design?: ReactNode | 'anchor' | 'terra' | string;
}

export function WalletCard({
  design,
  name,
  terraAddress,
  variant = 'medium',
  ref,
  ...containerProps
}: WalletCardProps) {
  const designElement = useMemo(() => {
    return isValidElement(design) ? (
      design
    ) : design === 'anchor' ? (
      <image
        xlinkHref="/assets/wallet/Anchor.svg"
        width={cardWidth}
        height={cardHeight}
      />
    ) : design === 'terra' ? (
      <image
        xlinkHref="/assets/wallet/Terra.svg"
        width={cardWidth}
        height={cardHeight}
      />
    ) : typeof design === 'string' ? (
      <rect fill={design} width={cardWidth} height={cardHeight} />
    ) : (
      <image
        xlinkHref="/assets/wallet/Terra.svg"
        width={cardWidth}
        height={cardHeight}
      />
    );
  }, [design]);

  return (
    <WalletCardContainer variant={variant} {...containerProps}>
      {designElement}
      <WalletCardTexts
        name={name}
        terraAddress={terraAddress}
        variant={variant}
      />
    </WalletCardContainer>
  );
}
