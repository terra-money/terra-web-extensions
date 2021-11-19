import { useWebExtensionConnector } from '@station/web-extension-react';
import React from 'react';

export function CurrentNetwork() {
  const { states } = useWebExtensionConnector();

  return <pre>{JSON.stringify(states?.network, null, 2)}</pre>;
}
