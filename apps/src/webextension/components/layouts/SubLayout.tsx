import { SvgButton } from '@station/ui';
import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';
import { ReactComponent as BackIcon } from './assets/back.svg';

export interface SubLayoutProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'title'
  > {
  title: ReactNode;
  onBack: () => void;
  rightSection?: ReactNode;
}

function Component({
  title,
  onBack,
  rightSection,
  children,
  ...divProps
}: SubLayoutProps) {
  return (
    <div {...divProps}>
      <header>
        <SvgButton width={24} height={24} onClick={onBack}>
          <BackIcon />
        </SvgButton>

        <h1>{title}</h1>

        <div className="right-section">{rightSection}</div>
      </header>
      <main>{children}</main>
    </div>
  );
}

const StyledComponent = styled(Component)`
  display: flex;
  flex-direction: column;
  height: 100vh;

  > header {
    height: 64px;
    background-color: var(--color-header-background);
    color: var(--color-header-text);

    padding: 0 20px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    > h1 {
      flex: 1;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
    }

    > .right-section {
      width: 24px;
    }
  }

  > main {
    flex: 1;

    overflow-y: auto;

    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
`;

export const SubLayout = fixHMR(StyledComponent);
