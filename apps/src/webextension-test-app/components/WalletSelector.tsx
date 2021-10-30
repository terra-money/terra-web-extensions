import { WalletCard, WalletCardSelector } from '@station/ui2';
import { useWalletSelect } from '@station/web-connector-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

export function WalletSelector() {
  const { wallets, selectWallet, selectedWallet } = useWalletSelect();

  const selectedIndex = useMemo<number>(() => {
    if (!selectedWallet) return 0;
    return wallets.findIndex(
      (itemWallet) => itemWallet.terraAddress === selectedWallet.terraAddress,
    );
  }, [selectedWallet, wallets]);

  const selectCard = useCallback(
    (nextSelectedIndex: number) => {
      const nextIndex = Math.min(
        Math.max(nextSelectedIndex, 0),
        wallets.length - 1,
      );
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
        cardHeight={90}
        selectedIndex={selectedIndex}
        onSelect={selectCard}
        style={{ height: 110 }}
      >
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.name}
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
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  justify-content: center;
`;
