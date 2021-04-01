import { Network } from '@terra-dev/network';
import {
  observeNetworkStorage,
  removeNetwork,
  selectNetwork,
} from '@terra-dev/webextension-network-storage';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div>
      <ul>
        {networks.map((network) => (
          <li key={network.name}>
            <span onClick={() => selectNetwork(network)}>
              [{network.name === selectedNetwork.name ? 'X' : ' '}]{' '}
              {network.name} ({network.chainID})
            </span>
            {defaultNetworks.indexOf(network) === -1 && (
              <button onClick={() => removeNetwork(network)}>Delete</button>
            )}
          </li>
        ))}
      </ul>

      <div>
        <Link to="/network/create">Add a new network</Link>
      </div>
    </div>
  );
}
