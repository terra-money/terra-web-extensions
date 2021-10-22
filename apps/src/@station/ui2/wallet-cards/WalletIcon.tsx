import React from 'react';
import { ReactComponent as TerraIcon } from './assets/symbols/terra.svg';
import { ReactComponent as LedgerIcon } from './assets/symbols/ledger.svg';
import { ReactComponent as MirrorIcon } from './assets/symbols/mirror.svg';
import { ReactComponent as AnchorIcon } from './assets/symbols/anchor.svg';

type IconDesign = 'terra' | 'anchor' | 'mirror' | 'ledger';

export interface WalletIconProps {
  design: IconDesign;
}

export function WalletIcon({ design }: WalletIconProps) {
  switch (design) {
    case 'terra':
      return <TerraIcon />;
    case 'anchor':
      return <AnchorIcon />;
    case 'ledger':
      return <LedgerIcon />;
    case 'mirror':
      return <MirrorIcon />;
  }
  return null;
}
