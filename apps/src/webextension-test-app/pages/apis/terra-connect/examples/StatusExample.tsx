import { useWebExtensionConnector } from '@station/web-extension-react';
import React from 'react';

export function StatusExample() {
  const { status, requestApproval } = useWebExtensionConnector();

  return (
    <div>
      <p>{JSON.stringify(status)}</p>
      {requestApproval && <button onClick={requestApproval}>Connect</button>}
    </div>
  );
}
