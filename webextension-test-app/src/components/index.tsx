import { ConnectSample } from 'pages/example/ConnectSample';
import { CW20TokensSample } from 'pages/example/CW20TokensSample';
import { NetworkSample } from 'pages/example/NetworkSample';
import { QuerySample } from 'pages/example/QuerySample';
import { SignBytesSample } from 'pages/example/SignBytesSample';
import { SignSample } from 'pages/example/SignSample';
import { TxSample } from 'pages/example/TxSample';
import React from 'react';

export function Example() {
  return (
    <div>
      <ConnectSample />
      <QuerySample />
      <TxSample />
      <SignSample />
      <SignBytesSample />
      <CW20TokensSample />
      <NetworkSample />
    </div>
  );
}
