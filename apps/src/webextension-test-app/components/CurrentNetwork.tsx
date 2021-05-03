import { useWebExtension } from '@terra-dev/web-extension-react';
import React from 'react';

export function CurrentNetwork() {
  const { clientStates } = useWebExtension();

  return <pre>{JSON.stringify(clientStates?.network, null, 2)}</pre>;
}
