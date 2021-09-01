import {
  NetworksData,
  observeNetworks,
} from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';
import { defaultNetworks } from '../env';

export function useNetworks(): NetworksData {
  const [networks, setNetworks] = useState<NetworksData>(() => ({
    networks: defaultNetworks,
    selectedNetwork: defaultNetworks[0],
  }));

  useEffect(() => {
    const subscription = observeNetworks(defaultNetworks).subscribe({
      next: setNetworks,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return networks;
}
