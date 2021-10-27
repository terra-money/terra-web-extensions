import { fixHMR } from 'fix-hmr';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Modal } from 'webextension/components/modal/Modal';

export interface DialogModalProps {
  className?: string;
  width?: number;
  height?: number;
  children: ReactNode;
  headerTitle: ReactNode;
  onClose: () => void;
}

function DialogModalBase({
  children,
  onClose,
  ...modalProps
}: DialogModalProps) {
  return (
    <Modal {...modalProps} onOutboundClick={onClose} onClose={onClose}>
      <div style={{ padding: 20 }}>{children}</div>
    </Modal>
  );
}

export const StyledDialogModal = styled(DialogModalBase)``;

/** @deprecated */
export const DialogModal = fixHMR(StyledDialogModal);
