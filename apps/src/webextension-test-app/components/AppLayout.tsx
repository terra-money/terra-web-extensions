import { Dashboard, Functions, WifiTethering } from '@material-ui/icons';
import { LinedList } from '@libs/station-ui/components/LinedList';
import { useWebExtension } from '@libs/web-extension-react';
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { WalletSelector } from './WalletSelector';

export interface AppLayoutProps {
  className?: string;
  children: ReactNode;
}

function AppLayoutBase({ className, children }: AppLayoutProps) {
  const { states } = useWebExtension();

  return (
    <div className={className}>
      <nav>
        <WalletSelector />

        <LinedList
          iconMarginRight="1em"
          firstLetterUpperCase={false}
          style={{ marginTop: 30 }}
        >
          <li>
            <NavLink to="/">
              <i>
                <Dashboard />
              </i>
              <span>Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/apis/terra-connect/api">
              <i>
                <Functions />
              </i>
              <span>API</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/apis/terra-connect/example">
              <i>
                <Functions />
              </i>
              <span>API Example</span>
            </NavLink>
          </li>
        </LinedList>

        <div />

        {states && (
          <LinedList
            iconMarginRight="1em"
            firstLetterUpperCase={false}
            style={{ marginBottom: 30 }}
          >
            <li>
              <div>
                <i>
                  <WifiTethering />
                </i>
                <span>Network</span>
              </div>
              <span>
                {states.network.name} ({states.network.chainID})
              </span>
            </li>
          </LinedList>
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
