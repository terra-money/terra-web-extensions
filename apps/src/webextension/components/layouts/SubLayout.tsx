import { SvgButton } from '@station/ui2';
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
        <div>
          <SvgButton width={24} height={24} onClick={onBack}>
            <BackIcon />
          </SvgButton>

          {rightSection}
        </div>

        <h1>{title}</h1>
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
    height: 116px;
    background-color: var(--color-header-background);
    color: var(--color-header-text);

    padding: 18px 20px 0 20px;

    > div {
      height: 24px;

      display: flex;
      justify-content: space-between;
      align-items: center;

      margin-bottom: 18px;
    }

    > h1 {
      font-size: 24px;
      font-weight: bold;
      line-height: 1.5;
    }
  }

  > main {
    flex: 1;

    overflow-y: auto;
  }
`;

export const SubLayout = fixHMR(StyledComponent);
