import React, { isValidElement, ReactNode, useMemo } from 'react';
import anchorImage from '../designs/Anchor.svg';
import terraImage from '../designs/Terra.svg';
import {
  WalletCardContainer,
  WalletCardContainerProps,
} from './WalletCardContainer';
import { WalletCardTexts, WalletCardTextsProps } from './WalletCardTexts';

export interface WalletCardProps
  extends Omit<WalletCardContainerProps, 'name'>,
    WalletCardTextsProps {
  design?: ReactNode | 'anchor' | 'terra';
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
      <image xlinkHref={anchorImage} width={700} height={380} />
    ) : design === 'terra' ? (
      <image xlinkHref={terraImage} width={700} height={380} />
    ) : typeof design === 'string' ? (
      <rect width={700} height={380} fill={design} />
    ) : (
      <image xlinkHref={terraImage} width={700} height={380} />
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
