import { useWebExtension } from '@terra-dev/web-extension-react';
import React from 'react';

export function NetworkExample() {
  const { clientStates } = useWebExtension();

  if (!clientStates) return null;

  return <pre>{JSON.stringify(clientStates.network, null, 2)}</pre>;
}
