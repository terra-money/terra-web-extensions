import { Network } from '@terra-dev/network';
import {
  observeNetworkStorage,
  selectNetwork,
} from '@terra-dev/webextension-network-storage';
import React, { useEffect, useState } from 'react';
import { defaultNetworks } from '../env';

export function NetworkSelector() {
  const [networks, setNetworks] = useState<Network[]>(defaultNetworks);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(
    () => defaultNetworks[0],
  );

  useEffect(() => {
    const subscription = observeNetworkStorage().subscribe(
      ({ networks, selectedNetwork }) => {
        setNetworks([...defaultNetworks, ...networks]);
        setSelectedNetwork(selectedNetwork ?? defaultNetworks[0]);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ul>
      {networks.map((network) => (
        <li key={network.name} onClick={() => selectNetwork(network)}>
          [{network.name === selectedNetwork.name ? 'X' : ' '}] {network.name} (
          {network.chainID})
        </li>
      ))}
    </ul>
  );
}
