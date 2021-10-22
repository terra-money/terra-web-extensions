import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as Logo } from 'webextension/assets/Logo.svg';
import { ConfigSelector } from 'webextension/components/header/ConfigSelector';
import { extensionPath } from 'webextension/logics/extensionPath';
import { POPUP_HEADER_HEIGHT, POPUP_HEADER_PADDING } from '../env';

export interface HeaderProps {
  className?: string;
}

const INDEX = extensionPath('index.html');

function HeaderBase({ className }: HeaderProps) {
  const rootMatch = useRouteMatch({
    exact: true,
    path: '/',
  });

  return (
    <header className={className}>
      {!!rootMatch ? (
        <a
          className="logo"
          href={INDEX}
          target="terra-station"
          rel="noreferrer"
        >
          <Logo />
        </a>
      ) : (
        <Link className="back" to="/">
          <ArrowBack />
        </Link>
      )}
      <ConfigSelector />
    </header>
  );
}

export const Header = styled(HeaderBase)`
  min-height: ${POPUP_HEADER_HEIGHT}px;
  max-height: ${POPUP_HEADER_HEIGHT}px;

  padding: 0 ${POPUP_HEADER_PADDING}px;

  a {
    color: #ffffff;
  }

  .logo {
    font-size: 0;

    svg {
      color: currentColor;
      width: 100px;
    }
  }

  .back {
    svg {
      font-size: 1.4em;
      transform: translateY(0.1em);
    }
  }

  display: flex;
  justify-content: space-between;
  align-items: center;
`;
