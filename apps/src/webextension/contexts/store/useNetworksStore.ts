import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import {
  NetworksData,
  observeNetworks,
} from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';

export function useNetworksStore(
  defaultNetworks: WebConnectorNetworkInfo[],
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
