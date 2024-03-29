import { SvgButton } from '@station/ui';
import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import styled from 'styled-components';

export interface DialogLayoutProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'title'
  > {
  title: ReactNode;
  onClose?: () => void;
}

function Component({
  title,
  onClose,
  children,
  ...divProps
}: DialogLayoutProps) {
  return (
    <div {...divProps}>
      <header>
        <h3>{title}</h3>
        <SvgButton width={24} height={24} onClick={onClose}>
          <MdClose />
        </SvgButton>
      </header>
      <main>{children}</main>
    </div>
  );
}

const StyledComponent = styled(Component)`
  padding: 24px;

  display: grid;
  grid-template-rows: auto 1fr;
  max-height: 100%;

  header {
    height: 24px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 20px;
  }

  main {
    height: 100%;
    min-height: 0;
    max-height: 100%;
  }
`;

export const DialogLayout = fixHMR(StyledComponent);
