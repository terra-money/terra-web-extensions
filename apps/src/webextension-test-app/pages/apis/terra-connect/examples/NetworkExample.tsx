import { useWebConnector } from '@station/web-connector-react';
import React from 'react';

export function NetworkExample() {
  const { states } = useWebConnector();

  if (!states) return null;

  return <pre>{JSON.stringify(states.network, null, 2)}</pre>;
}
