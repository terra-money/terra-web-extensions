import { Button } from '@station/ui';
import {
  approveHostnames,
  readWalletsStorage,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useMemo, useState } from 'react';
import { MdDomainVerification } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ApproveHostname } from 'webextension/components/views/ApproveHostname';
import { ViewCenterLayout } from 'webextension/components/views/components/ViewCenterLayout';
import { useAllowedCommandId } from 'webextension/contexts/commands';
import { TX_PORT_PREFIX } from 'webextension/env';

export function ConnectPopup() {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const { search } = useLocation();

  const connectInfo = useMemo(() => {
    const params = new URLSearchParams(search);

    const id = params.get('id');
    const hostname = params.get('hostname');

    if (!id || !hostname) {
      throw new Error(`Can't find params!`);
    }

    return {
      id,
      hostname,
    };
  }, [search]);

  useAllowedCommandId(connectInfo.id, '/error/abnormal-approach');

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [noWallets, setNoWallets] = useState<boolean>(false);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const approve = useCallback(async () => {
    await approveHostnames(connectInfo.hostname);

    const port = browser.runtime.connect(undefined, {
      name: TX_PORT_PREFIX + connectInfo.id,
    });

    port.postMessage(true);

    port.disconnect();
  }, [connectInfo.hostname, connectInfo.id]);

  const deny = useCallback(() => {
    const port = browser.runtime.connect(undefined, {
      name: TX_PORT_PREFIX + connectInfo.id,
    });

    port.postMessage(false);

    port.disconnect();
  }, [connectInfo.id]);

  const approveConnect = useCallback(async () => {
    const { wallets } = await readWalletsStorage();

    if (wallets.length > 0) {
      await approve();
    } else {
      setNoWallets(true);
    }
  }, [approve]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (noWallets) {
    return (
      <Center>
        <ViewCenterLayout
          className="content"
          icon={<MdDomainVerification />}
          title="You don't have any wallets"
          footer={
            <Button variant="primary" size="large" onClick={deny}>
              OK
            </Button>
          }
        >
          <p>Please make any wallets first!</p>
        </ViewCenterLayout>
      </Center>
    );
  }

  return (
    <Center>
      <ApproveHostname
        className="content"
        hostname={connectInfo.hostname}
        onCancel={deny}
        onConfirm={approveConnect}
      />
    </Center>
  );
}

const Center = styled.div`
  .content {
    height: 100vh;
  }
`;
