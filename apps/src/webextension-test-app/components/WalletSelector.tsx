import { useWalletSelect } from '@terra-dev/terra-connect-react';
import { WalletCard, WalletCardSelector } from '@terra-dev/wallet-card';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

export function WalletSelector() {
  const { wallets, selectWallet } = useWalletSelect();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const selectCard = useCallback(
    (nextSelectedIndex: number) => {
      const nextIndex = Math.min(
        Math.max(nextSelectedIndex, 0),
        wallets.length - 1,
      );
      setSelectedIndex(nextIndex);
      selectWallet(wallets[nextIndex]);
    },
    [selectWallet, wallets],
  );

  if (wallets.length === 0) {
    return null;
  }

  return (
    <Layout>
      <WalletCardSelector
        cardWidth={180}
        selectedIndex={selectedIndex}
        onSelect={selectCard}
      >
        {wallets.map((wallet) => (
          <WalletCard
            variant="small"
            name={wallet.name}
            terraAddress={wallet.terraAddress}
            design={wallet.design}
          />
        ))}
      </WalletCardSelector>
    </Layout>
  );
}

const Layout = styled.div`
  width: 280px;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
`;
