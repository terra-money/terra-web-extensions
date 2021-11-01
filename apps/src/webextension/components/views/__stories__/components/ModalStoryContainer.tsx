import { Modal } from '@station/ui';
import { fixHMR } from 'fix-hmr';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { DialogLayout } from 'webextension/components/layouts/DialogLayout';

export interface ModalStoryContainerProps {
  className?: string;
  children: ReactNode;
}

function Component({ className, children }: ModalStoryContainerProps) {
  return (
    <Modal onClose={console.log}>
      <DialogLayout
        title="Add tokens"
        onClose={console.log}
        className={className}
      >
        {children}
      </DialogLayout>
    </Modal>
  );
}

const StyledComponent = styled(Component)`
  width: 400px;
  min-height: 500px;
  max-height: 500px;
`;

export const ModalStoryContainer = fixHMR(StyledComponent);
