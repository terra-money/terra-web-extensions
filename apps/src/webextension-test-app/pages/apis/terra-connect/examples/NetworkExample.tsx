import { useWebExtension } from '@packages/web-extension-react';
import React from 'react';

export function NetworkExample() {
  const { states } = useWebExtension();

  if (!states) return null;

  return <pre>{JSON.stringify(states.network, null, 2)}</pre>;
}
