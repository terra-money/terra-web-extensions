import { useWebExtensionConnector } from '@station/web-extension-react';
import React, { ReactNode } from 'react';
import { MdDashboard, MdFunctions, MdWifiTethering } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { WalletSelector } from './WalletSelector';

export interface AppLayoutProps {
  className?: string;
  children: ReactNode;
}

function AppLayoutBase({ className, children }: AppLayoutProps) {
  const { states } = useWebExtensionConnector();

  return (
    <div className={className}>
      <nav>
        <WalletSelector />

        <ul style={{ marginTop: 30 }}>
          <li>
            <NavLink to="/">
              <i>
                <MdDashboard />
              </i>
              <span>Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/apis/terra-connect/api">
              <i>
                <MdFunctions />
              </i>
              <span>API</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/apis/terra-connect/example">
              <i>
                <MdFunctions />
              </i>
              <span>API Example</span>
            </NavLink>
          </li>
        </ul>

        <div />

        {states && (
          <ul style={{ marginBottom: 30 }}>
            <li>
              <div>
                <i>
                  <MdWifiTethering />
                </i>
                <span>Network</span>
              </div>
              <span>
                {states.network.name} ({states.network.chainID})
              </span>
            </li>
          </ul>
        )}
      </nav>
      <main>
        <article>{children}</article>
      </main>
    </div>
  );
}

export const AppLayout = styled(AppLayoutBase)`
  width: 100vw;
  height: 100vh;

  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 1fr;

  background-color: #fcfcfc;

  > nav {
    display: flex;
    flex-direction: column;

    background-color: #ffffff;

    padding: 30px 0 0 0;

    box-shadow: 1px 0px 24px 2px rgba(0, 0, 0, 0.07);

    > ul {
      font-size: 13px;
      padding: 0 20px;
    }

    > div:empty {
      flex: 1;
    }
  }

  > main {
    overflow-x: hidden;
    overflow-y: auto;

    padding: 30px;

    font-size: 13px;
  }
`;
