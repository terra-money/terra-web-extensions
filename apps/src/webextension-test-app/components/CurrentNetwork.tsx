import { useTerraConnect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function CurrentNetwork() {
  const { clientStates } = useTerraConnect();

  return <pre>{JSON.stringify(clientStates?.network, null, 2)}</pre>;
}
