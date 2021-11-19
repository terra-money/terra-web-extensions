import { DialogProps, OpenDialog, useDialog } from '@libs/use-dialog';
import { Modal, SvgButton } from '@station/ui';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';
import { removeNetwork } from '@terra-dev/web-extension-backend';
import React, { ReactNode, useCallback } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';
import { useNetworksStore } from 'webextension/contexts/store/useNetworksStore';

interface FormParams {
  className?: string;
}

type FormReturn = void;

export function useManageNetworksDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  className,
  closeDialog,
}: DialogProps<FormParams, FormReturn>) {
  const { networks } = useNetworksStore([]);

  const remove = useCallback(
    async (network: WebExtensionNetworkInfo) => {
      await removeNetwork(network);

      if (networks.length - 1 <= 0) {
        closeDialog();
      }
    },
    [closeDialog, networks.length],
  );

  return (
    <Modal onClose={() => closeDialog()}>
      <DialogLayout
        title="Manage networks"
        onClose={() => closeDialog()}
        className={className}
      >
        <NetworkList>
          {networks.map((itemNetwork) => (
            <li key={itemNetwork.name}>
              <div className="name-wrapper">
                <span>{itemNetwork.name}</span>
                <span>{itemNetwork.chainID}</span>
              </div>
              <div>
                <SvgButton
                  width={24}
                  height={24}
                  onClick={() => remove(itemNetwork)}
                >
                  <MdDeleteForever />
                </SvgButton>
              </div>
            </li>
          ))}
        </NetworkList>
      </DialogLayout>
    </Modal>
  );
}

const Component = styled(ComponentBase)`
  width: 400px;
  min-height: 450px;
  max-height: 450px;

  --network-list-height: 350px;
`;

const NetworkList = styled.ul`
  list-style: none;
  padding: 0;

  display: flex;
  flex-direction: column;

  height: var(--network-list-height, auto);
  overflow-y: auto;

  li {
    padding: 12px 0;

    color: var(--color-content-text);

    display: flex;
    justify-content: space-between;
    align-items: center;

    .name-wrapper {
      display: flex;
      flex-direction: column;
      gap: 3px;

      > :first-child {
        font-size: 14px;
        font-weight: bold;
      }

      > :nth-child(2) {
        font-size: 12px;
      }
    }
  }
`;
