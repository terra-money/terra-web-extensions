import { useWebExtensionConnector } from '@station/web-extension-react';
import { WebExtensionStatus } from '@terra-dev/web-extension-interface';
import React from 'react';

export function NetworkExample() {
  const { states } = useWebExtensionConnector();

  if (states.type !== WebExtensionStatus.READY) {
    return null;
  }

  return <pre>{JSON.stringify(states.network, null, 2)}</pre>;
}
