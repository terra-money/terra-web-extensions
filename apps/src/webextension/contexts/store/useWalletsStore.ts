import { observeWallets, WalletsData } from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';

export function useWalletsStore(
  fallbackFocusing: boolean = false,
): WalletsData {
  const [data, setData] = useState<WalletsData>(() => ({
    wallets: [],
    focusedWalletAddress: undefined,
    focusedWallet: undefined,
    focusedWalletIndex: -1,
  }));

  useEffect(() => {
    const subscription = observeWallets(fallbackFocusing).subscribe({
      next: setData,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fallbackFocusing]);

  return data;
}
