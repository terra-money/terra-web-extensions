import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { addNetwork } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import {
  CreateNetwork,
  CreateNetworkResult,
} from 'webextension/components/views/CreateNetwork';

export function NetworksCreate({ history }: RouteComponentProps<{}>) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(
    async (result: CreateNetworkResult) => {
      const network: WebConnectorNetworkInfo = {
        name: result.name,
        chainID: result.chainID,
        lcd: result.lcd,
      };

      await addNetwork(network);

      history.push('/');
    },
    [history],
  );

  return (
    <SubLayout title="Add a new Network" onBack={cancel}>
      <CreateNetwork onCreate={create} />
    </SubLayout>
  );
}
