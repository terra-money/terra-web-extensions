import styled from 'styled-components';
import React from 'react';

export interface WalletCardDesignSelectorProps {
  className?: string;
}

function WalletCardDesignSelectorBase({
  className,
}: WalletCardDesignSelectorProps) {
  return <div className={className}>...</div>;
}

export const WalletCardDesignSelector = styled(WalletCardDesignSelectorBase)`
  // TODO
`;
