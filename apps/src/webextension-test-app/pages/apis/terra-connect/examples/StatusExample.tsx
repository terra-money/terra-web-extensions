import { useWebExtension } from '@packages/web-extension-react';
import React from 'react';

export function StatusExample() {
  const { status, requestApproval } = useWebExtension();

  return (
    <div>
      <p>{JSON.stringify(status)}</p>
      {requestApproval && <button onClick={requestApproval}>Connect</button>}
    </div>
  );
}
