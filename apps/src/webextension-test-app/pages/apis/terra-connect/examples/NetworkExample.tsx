import { useTerraConnect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function NetworkExample() {
  const { clientStates } = useTerraConnect();

  if (!clientStates) return null;

  return <pre>{JSON.stringify(clientStates.network, null, 2)}</pre>;
}
