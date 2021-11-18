import { useWalletConnector } from '@station/web-connector-react';
import React from 'react';

export function StatusExample() {
  const { status, requestApproval } = useWalletConnector();

  return (
    <div>
      <p>{JSON.stringify(status)}</p>
      {requestApproval && <button onClick={requestApproval}>Connect</button>}
    </div>
  );
}
