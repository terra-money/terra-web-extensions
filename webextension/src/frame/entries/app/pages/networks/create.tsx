import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';
import { addNetwork } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import {
  CreateNetwork,
  CreateNetworkResult,
} from 'frame/components/views/CreateNetwork';
import { useStore } from 'frame/contexts/store';

export function NetworksCreate({ history }: RouteComponentProps<{}>) {
  const { networks } = useStore();

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const create = useCallback(
    async (result: CreateNetworkResult) => {
      const network: WebExtensionNetworkInfo = {
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
      <CreateNetwork networks={networks} onCreate={create} />
    </SubLayout>
  );
}
