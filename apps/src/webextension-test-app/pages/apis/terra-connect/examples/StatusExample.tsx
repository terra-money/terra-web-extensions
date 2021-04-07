import { useTerraConnect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function StatusExample() {
  const { status } = useTerraConnect();

  return <div>{JSON.stringify(status)}</div>;
}
