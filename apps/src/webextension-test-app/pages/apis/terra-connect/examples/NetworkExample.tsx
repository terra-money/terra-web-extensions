import { useWalletConnector } from '@station/web-connector-react';
import React from 'react';

export function NetworkExample() {
  const { states } = useWalletConnector();

  if (!states) return null;

  return <pre>{JSON.stringify(states.network, null, 2)}</pre>;
}
