import {
  NetworksData,
  observeNetworks,
} from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';
import { DEFAULT_NETWORKS } from 'webextension/env';

export function useNetworksStore(): NetworksData {
  const [networks, setNetworks] = useState<NetworksData>(() => ({
    networks: DEFAULT_NETWORKS,
    selectedNetwork: undefined,
  }));

  useEffect(() => {
    const subscription = observeNetworks(DEFAULT_NETWORKS).subscribe({
      next: setNetworks,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return networks;
}
