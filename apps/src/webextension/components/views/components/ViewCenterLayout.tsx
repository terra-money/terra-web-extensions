import { fixHMR } from 'fix-hmr';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

export interface ViewCenterLayoutProps {
  className?: string;
  icon: ReactNode;
  variant?: 'primary' | 'danger';
  title: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
}

function Component({
  className,
  icon,
  title,
  children,
  footer,
  variant = 'primary',
}: ViewCenterLayoutProps) {
  return (
    <div className={className} data-variant={variant}>
      <header>
        <div className="icon-wrapper">{icon}</div>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}

const StyledComponent = styled(Component)`
  width: 100%;
  height: 100%;

  padding: 20px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: var(--color-content-text);

  &[data-variant='danger'] {
    color: var(--color-content-text-danger);
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;

    .icon-wrapper {
      svg {
        width: 60px;
        height: 60px;
      }
    }

    h1 {
      font-size: 24px;
      font-weight: bold;
      line-height: 1.5;
    }
  }

  main {
    margin-top: 5px;

    font-size: 16px;
    line-height: 1.5;

    p {
      text-align: center;
      max-width: 90%;
      margin: 0 auto;
    }

    &:empty {
      display: none;
    }
  }

  footer {
    margin-top: 40px;

    width: 100%;

    display: flex;
    gap: 10px;

    > * {
      flex: 1;
    }
  }
`;

export const ViewCenterLayout = fixHMR(StyledComponent);
