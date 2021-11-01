import { Button, ListBox, SvgButton } from '@station/ui';
import {
  disapproveHostname,
  observeHostnamesStorage,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useState } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { SubLayout } from 'webextension/components/layouts/SubLayout';

export function DApps({ history }: RouteComponentProps) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  const [approvedHostnames, setApprovedHostnames] = useState<string[]>(
    () => [],
  );

  useEffect(() => {
    const subscription = observeHostnamesStorage().subscribe(
      (nextHostnamesStorageData) => {
        setApprovedHostnames(nextHostnamesStorageData.approvedHostnames);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const disapprove = useCallback(async (hostname: string) => {
    await disapproveHostname(hostname);
  }, []);

  return (
    <SubLayout title="Whitelist dApps" onBack={cancel}>
      <FormMain>
        <ListBox>
          {approvedHostnames.map((approvedHostname) => (
            <ListItem key={approvedHostname}>
              <span>{approvedHostname}</span>
              <SvgButton
                width={24}
                height={24}
                onClick={() => disapprove(approvedHostname)}
              >
                <MdDeleteForever />
              </SvgButton>
            </ListItem>
          ))}
        </ListBox>
      </FormMain>

      <FormFooter>
        <Button variant="primary" size="large" onClick={cancel}>
          Confirm
        </Button>
      </FormFooter>
    </SubLayout>
  );
}

const ListItem = styled.li`
  padding: 0 20px;
  height: 60px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 14px;
  font-weight: 700;
`;
