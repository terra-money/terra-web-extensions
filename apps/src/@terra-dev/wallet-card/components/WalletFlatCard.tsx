import React from 'react';
import {
  WalletCardContainer,
  WalletCardContainerProps,
} from './WalletCardContainer';
import { WalletCardTexts, WalletCardTextsProps } from './WalletCardTexts';

export interface WalletFlatCardProps
  extends Omit<WalletCardContainerProps, 'name'>,
    WalletCardTextsProps {
  backgroundColor: string;
}

export function WalletFlatCard({
  backgroundColor,
  name,
  terraAddress,
  variant,
  ref,
  ...containerProps
}: WalletFlatCardProps) {
  return (
    <WalletCardContainer variant={variant} {...containerProps}>
      <rect width={700} height={380} fill={backgroundColor} />
      <WalletCardTexts
        name={name}
        terraAddress={terraAddress}
        variant={variant}
      />
    </WalletCardContainer>
  );
}
