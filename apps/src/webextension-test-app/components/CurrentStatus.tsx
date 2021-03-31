import { useTerraConnect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function CurrentStatus() {
  const { status } = useTerraConnect();

  return <p>{JSON.stringify(status)}</p>;
}
