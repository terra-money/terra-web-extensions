import { WalletNetworkInfo } from '@terra-dev/wallet-interface';
import {
  NetworksData,
  observeNetworks,
} from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';

export function useNetworksStore(
  defaultNetworks: WalletNetworkInfo[],
): NetworksData {
  const [networks, setNetworks] = useState<NetworksData>(() => ({
    networks: defaultNetworks,
    selectedNetwork: undefined,
  }));

  useEffect(() => {
    const subscription = observeNetworks(defaultNetworks).subscribe({
      next: setNetworks,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [defaultNetworks]);

  return networks;
}
