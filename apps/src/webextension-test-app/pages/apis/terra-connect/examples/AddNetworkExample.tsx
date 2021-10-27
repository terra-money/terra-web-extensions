import { useWebConnector } from '@station/web-connector-react';
import React, { useCallback, useEffect, useState } from 'react';

const network = {
  name: 'test-network',
  chainID: 'bombay-12',
  lcd: 'https://lcd.terra.dev',
};

export function AddNetworkExample() {
  const { hasNetwork, addNetwork } = useWebConnector();

  const [networkExists, setNetworkExists] = useState<
    'exists' | 'not exists' | null
  >(null);

  const reloadNetworkExists = useCallback(async () => {
    const result = await hasNetwork(network.chainID, network.lcd);
    setNetworkExists(result ? 'exists' : 'not exists');
  }, [hasNetwork]);

  const add = useCallback(async () => {
    const nextNetworkExists = await addNetwork(
      network.name,
      network.chainID,
      network.lcd,
    );
    setNetworkExists(nextNetworkExists ? 'exists' : 'not exists');
  }, [addNetwork]);

  useEffect(() => {
    reloadNetworkExists();
  }, [reloadNetworkExists]);

  return (
    <div>
      <pre>{networkExists}</pre>

      {networkExists === 'not exists' && (
        <button onClick={() => add()}>Add Network</button>
      )}
    </div>
  );
}
