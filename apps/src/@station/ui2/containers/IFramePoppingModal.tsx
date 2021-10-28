import React from 'react';
import { PoppingModal, PoppingModalProps } from './PoppingModal';

export interface IFramePoppingModalProps
  extends Omit<PoppingModalProps, 'ref' | 'children'> {
  src: string;
}

export function IFramePoppingModal({
  src,
  ...poppingModalProps
}: IFramePoppingModalProps) {
  return (
    <PoppingModal {...poppingModalProps}>
      <iframe
        title={src}
        src={src}
        frameBorder={0}
        allowTransparency={false}
        style={{ width: '100%', height: '100%' }}
      />
    </PoppingModal>
  );
}
