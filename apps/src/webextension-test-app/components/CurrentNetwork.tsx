import { useWebExtension } from '@terra-dev/web-extension-react';
import React from 'react';

export function CurrentNetwork() {
  const { states } = useWebExtension();

  return <pre>{JSON.stringify(states?.network, null, 2)}</pre>;
}
