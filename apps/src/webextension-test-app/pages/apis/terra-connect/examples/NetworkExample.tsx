import { useWebExtensionConnector } from '@station/web-extension-react';
import React from 'react';

export function NetworkExample() {
  const { states } = useWebExtensionConnector();

  if (!states) return null;

  return <pre>{JSON.stringify(states.network, null, 2)}</pre>;
}
