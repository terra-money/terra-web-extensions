import { PoppingModal } from '@station/ui';
import React, { ReactNode } from 'react';
import { LOGO } from 'frame/entries/content/env';

export interface PopupStoryContainerProps {
  children: ReactNode;
  title?: ReactNode;
}

export function PopupStoryContainer({
  children,
  title,
}: PopupStoryContainerProps) {
  return (
    <PoppingModal
      logo={LOGO}
      onClose={console.log}
      width="450px"
      height={title ? '600px' : '546px'}
      title={title}
    >
      <main style={{ height: '100%', maxHeight: 484, overflowY: 'auto' }}>
        {children}
      </main>
    </PoppingModal>
  );
}
