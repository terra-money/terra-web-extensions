import { useWebConnector } from '@station/web-connector-react';
import React from 'react';

export function CurrentNetwork() {
  const { states } = useWebConnector();

  return <pre>{JSON.stringify(states?.network, null, 2)}</pre>;
}
