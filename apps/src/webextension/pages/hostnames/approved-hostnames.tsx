import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  disapproveHostname,
  observeWalletStorage,
} from 'webextension/backend/wallet-storage';

export interface ApprovedHostnamesProps {
  className?: string;
}

function ApprovedHostnamesBase({ className }: ApprovedHostnamesProps) {
  const [approvedHostnames, setApprovedHostnames] = useState<string[]>(
    () => [],
  );

  useEffect(() => {
    const subscription = observeWalletStorage().subscribe(
      (nextWalletStorageData) => {
        setApprovedHostnames(nextWalletStorageData.approvedHostnames);
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

export const ApprovedHostnames = styled(ApprovedHostnamesBase)`
  // TODO
`;
