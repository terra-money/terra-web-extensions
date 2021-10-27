import React from 'react';
import { Modal } from './Modal';

export interface IFrameModalProps {
  className?: string;
  width?: number;
  height?: number;
  title: string;
  src: string;
  onClose: () => void;
}

/** @deprecated */
export function IFrameModal({ title, src, ...modalProps }: IFrameModalProps) {
  return (
    <Modal {...modalProps}>
      <iframe title={title} src={src} frameBorder={0} />
    </Modal>
  );
}
