import React from 'react';
import styled from 'styled-components';
import { CurrentNetwork } from 'webextension-test-app/components/CurrentNetwork';
import { CurrentStatus } from 'webextension-test-app/components/CurrentStatus';
import { CurrentWallet } from 'webextension-test-app/components/CurrentWallet';

export interface PreviewProps {
  className?: string;
}

function PreviewBase({ className }: PreviewProps) {
  return (
    <section className={className}>
      <section>
        <h1>Current Client Status</h1>
        <CurrentStatus />
        <h1>Current Network</h1>
        <CurrentNetwork />
        <h1>Current Wallet</h1>
        <CurrentWallet />
      </section>
    </section>
  );
}

export const Overview = styled(PreviewBase)``;
