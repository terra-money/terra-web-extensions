import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as Logo } from '../../assets/Logo.svg';
import { headerHeight, headerPadding } from '../../env';
import { ConfigSelector } from './ConfigSelector';

export interface PopupHeaderProps {
  className?: string;
}

function PopupHeaderBase({ className }: PopupHeaderProps) {
  return (
    <header className={className}>
      <Link className="logo" to="/">
        <Logo />
      </Link>
      <ConfigSelector />
    </header>
  );
}

export const PopupHeader = styled(PopupHeaderBase)`
  min-height: ${headerHeight}px;
  max-height: ${headerHeight}px;

  padding: 0 ${headerPadding}px;

  .logo {
    color: #ffffff;
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
