import { fixHMR } from 'fix-hmr';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export interface WelcomeProps {
  className?: string;
}

function Component({ className }: WelcomeProps) {
  return (
    <div className={className}>
      <h1>Welcome</h1>
      <h2>Please create a wallet</h2>
      <ul>
        <li>
          <Link to="/connect-ledger">Connect ledger</Link>
        </li>
        <li>
          <Link to="/wallets/create">Create new wallet</Link>
        </li>
        <li>
          <Link to="/wallets/recover">Recover a wallet</Link>
        </li>
      </ul>
    </div>
  );
}

const StyledComponent = styled(Component)`
  width: 100vw;
  height: 100vh;

  display: grid;
  place-content: center;
`;

export const Welcome = fixHMR(StyledComponent);
