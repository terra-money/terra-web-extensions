import { useWebExtensionConnector } from '@station/web-extension-react';
import React from 'react';

export function StatusExample() {
  const { states, requestApproval } = useWebExtensionConnector();

  return (
    <div>
      <pre>{JSON.stringify(states, null, 2)}</pre>
      {requestApproval && <button onClick={requestApproval}>Connect</button>}
    </div>
  );
}
