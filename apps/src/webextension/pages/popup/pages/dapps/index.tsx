import {
  disapproveHostname,
  observeHostnamesStorage,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

export interface DAppsProps {
  className?: string;
}

function DAppsBase({ className }: DAppsProps) {
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
    <div className={className}>
      <ul>
        {approvedHostnames.map((approvedHostname) => (
          <li key={approvedHostname}>
            {approvedHostname}
            <button onClick={() => disapprove(approvedHostname)}>
              Disapprove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const DApps = styled(DAppsBase)`
  // TODO
`;
