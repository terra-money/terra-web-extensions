import { fixHMR } from 'fix-hmr';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as Logo } from 'webextension/assets/Logo.svg';
import { ConfigSelector } from 'webextension/components/header/ConfigSelector';
import { INDEX_HEADER_HEIGHT, INDEX_HEADER_PADDING } from '../env';

export interface HeaderProps {
  className?: string;
}

function HeaderBase({ className }: HeaderProps) {
  return (
    <header className={className}>
      <Link className="logo" to="/">
        <Logo />
      </Link>
      <ConfigSelector />
    </header>
  );
}

export const StyledHeader = styled(HeaderBase)`
  min-height: ${INDEX_HEADER_HEIGHT}px;
  max-height: ${INDEX_HEADER_HEIGHT}px;

  padding: 0 ${INDEX_HEADER_PADDING}px;

  background-color: #0c3694;

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

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Header = fixHMR(StyledHeader);
