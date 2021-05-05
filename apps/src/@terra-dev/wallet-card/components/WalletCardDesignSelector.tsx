import React, { useCallback, useMemo } from 'react';
import { WalletCard } from './WalletCard';
import {
  WalletCardSelector,
  WalletCardSelectorProps,
} from './WalletCardSelector';

export interface WalletCardDesignSelectorProps
  extends Omit<
    WalletCardSelectorProps,
    'selectedIndex' | 'onSelect' | 'onCreate' | 'children' | 'onChange'
  > {
  name: string;
  terraAddress: string;
  designs: string[];
  design: string;
  onChange: (nextDesign: string) => void;
}

export function WalletCardDesignSelector({
  name,
  terraAddress,
  designs,
  design,
  onChange,
  ref,
  ...selectorProps
}: WalletCardDesignSelectorProps) {
  const selectedIndex = useMemo<number>(() => {
    return designs.findIndex((itemDesign) => itemDesign === design);
  }, [design, designs]);

  const updateSelectedIndex = useCallback(
    (nextSelectedIndex: number) => {
      onChange(designs[nextSelectedIndex]);
    },
    [designs, onChange],
  );

  return (
    <WalletCardSelector
      selectedIndex={selectedIndex}
      onSelect={updateSelectedIndex}
      onCreate={() => {}}
      {...selectorProps}
    >
      {designs.map((itemDesign) => (
        <WalletCard
          key={itemDesign}
          name={name}
          terraAddress={terraAddress}
          design={itemDesign}
        />
      ))}
    </WalletCardSelector>
  );
}
