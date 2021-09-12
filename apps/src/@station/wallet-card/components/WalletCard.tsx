import React, { isValidElement, ReactNode, useMemo } from 'react';
import { cardHeight, cardWidth } from '../env';
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
  onAddressClick,
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
      <rect fill={design} width={cardWidth + 20} height={cardHeight + 20} />
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
        onAddressClick={onAddressClick}
      />
    </WalletCardContainer>
  );
}
