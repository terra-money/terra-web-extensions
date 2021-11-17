import {
  addNetwork,
  findSimilarNetwork,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { useAllowedCommandId } from 'webextension/contexts/commands';
import { TX_PORT_PREFIX } from 'webextension/env';
import { getDefaultNetworks } from 'webextension/queries/useDefaultNetworks';

export function AddNetworkPopup() {
  const { search } = useLocation();

  const addNetworkQuery = useMemo(() => {
    const params = new URLSearchParams(search);

    const id = params.get('id');
    const name = params.get('name');
    const chainID = params.get('chain-id');
    const lcd = params.get('lcd');

    if (!id || !chainID || !lcd) {
      throw new Error(`Can't find params!`);
    }

    return {
      id,
      name,
      chainID,
      lcd,
    };
  }, [search]);

  useAllowedCommandId(addNetworkQuery.id, '/error/abnormal-approach');

  const [similarNetworkExists, setSimilarNetworkExists] =
    useState<boolean>(false);

  const [name, setName] = useState<string>(() => addNetworkQuery.name ?? '');

  useEffect(() => {
    getDefaultNetworks()
      .then((defaultNetworks) =>
        findSimilarNetwork(
          defaultNetworks,
          addNetworkQuery.chainID,
          addNetworkQuery.lcd,
        ),
      )
      .then((foundNetwork) => {
        setSimilarNetworkExists(!!foundNetwork);
      });
  }, [addNetworkQuery.chainID, addNetworkQuery.lcd]);

  const add = useCallback(async () => {
    await addNetwork({
      name,
      chainID: addNetworkQuery.chainID,
      lcd: addNetworkQuery.lcd,
    });

    const port = browser.runtime.connect(undefined, {
      name: TX_PORT_PREFIX + addNetworkQuery.id,
    });

    port.postMessage(true);

    port.disconnect();
  }, [addNetworkQuery.chainID, addNetworkQuery.id, addNetworkQuery.lcd, name]);

  const close = useCallback(async () => {
    const port = browser.runtime.connect(undefined, {
      name: TX_PORT_PREFIX + addNetworkQuery.id,
    });

    port.postMessage(false);

    port.disconnect();
  }, [addNetworkQuery.id]);

  if (similarNetworkExists) {
    return (
      <div>
        <pre>{JSON.stringify(addNetworkQuery, null, 2)}</pre>
        <p>Already exists the network</p>
        <button onClick={close}>Close</button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={({ currentTarget }) => setName(currentTarget.value)}
      />

      <ul>
        <li>chainID: {addNetworkQuery.chainID}</li>
        <li>lcd: {addNetworkQuery.lcd}</li>
      </ul>

      <footer>
        <button onClick={close}>Cancel</button>
        <button onClick={add}>Add</button>
      </footer>
    </div>
  );
}
