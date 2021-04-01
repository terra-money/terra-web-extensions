import { Network } from '@terra-dev/network';
import { addNetwork } from '@terra-dev/webextension-network-storage';
import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { defaultNetworks } from '../../env';

const serversPlaceHolder = JSON.stringify(defaultNetworks[0].servers, null, 2);

export function NetworkCreate({ history }: RouteComponentProps<{}>) {
  const [name, setName] = useState<string>('');
  const [chainID, setChainID] = useState<string>('');
  const [servers, setServers] = useState<string>(serversPlaceHolder);

  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async () => {
    let serversJson: Network['servers'];

    try {
      serversJson = JSON.parse(servers);

      if (typeof serversJson.lcd !== 'string') {
        setError('lcd is required!');
        return;
      }
    } catch (error) {
      setError('servers is not a json string');
      return;
    }

    const network: Network = {
      name,
      chainID,
      servers: serversJson,
    };

    await addNetwork(network);

    history.push('/');
  }, [chainID, history, name, servers]);

  return (
    <section>
      <div>
        <Link to="/">Back to Main</Link>

        <h3>Network Name</h3>
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />

        <h3>Chain ID</h3>
        <input
          type="text"
          value={chainID}
          onChange={({ target }) => setChainID(target.value)}
        />

        <h3>Servers</h3>
        <textarea
          style={{ width: '100%', height: 250 }}
          placeholder={serversPlaceHolder}
          value={servers}
          onChange={({ target }) => setServers(target.value)}
        />
      </div>

      <div>
        {error && <div>{error}</div>}
        <button onClick={create}>Create Network</button>
      </div>
    </section>
  );
}
