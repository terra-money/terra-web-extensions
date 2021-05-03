import { useWebExtension } from '@terra-dev/web-extension-react';
import React from 'react';

export function StatusExample() {
  const { status } = useWebExtension();

  return <div>{JSON.stringify(status)}</div>;
}
