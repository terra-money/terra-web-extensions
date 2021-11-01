import { Portal } from '@mantine/core';
import React, {
  createContext,
  DetailedHTMLProps,
  HTMLAttributes,
  useContext,
  useEffect,
} from 'react';
import styled, { keyframes } from 'styled-components';

export interface ModalProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'ref'
  > {
  zIndex?: number;
  onClose?: () => void;
}

export function Modal({ zIndex = 1000, onClose, ...divProps }: ModalProps) {
  useEffect(() => {
    if (typeof onClose !== 'function') {
      return;
    }

    function handler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keyup', handler);

    return () => {
      window.removeEventListener('keyup', handler);
    };
  }, [onClose]);

  return (
    <Portal zIndex={zIndex}>
      <Overlay>
        {onClose && <ClickOutside onClick={onClose} />}
        <ModalContext.Provider value={{ onClose }}>
          <Dialog {...divProps} />
        </ModalContext.Provider>
      </Overlay>
    </Portal>
  );
}

const ModalContext = createContext<Pick<ModalProps, 'onClose'>>({});

export function useModalContext(): Pick<ModalProps, 'onClose'> {
  return useContext(ModalContext);
}

const enter = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.6);
  }
  
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const slide = keyframes`
  from {
    opacity: 0;
    transform: translateY(80%);
  }
  
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Dialog = styled.div`
  position: absolute;

  background-color: var(--color-dialog-background);
  color: var(--color-dialog-color);

  --dialog-padding-bottom: 40px;

  @media (min-width: 700px) {
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);

    border-radius: 20px;

    box-shadow: 0 0 33px 8px rgba(0, 0, 0, 0.4);

    animation: ${enter} 0.2s ease-out;
    transform-origin: center;
  }

  @media (max-width: 699px) {
    width: 100vw;
    max-width: 100vw;
    max-height: 100vh;

    //overflow-y: auto;

    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;

    padding-bottom: var(--dialog-padding-bottom);

    border-top-left-radius: 16px;
    border-top-right-radius: 16px;

    box-shadow: 0 0 33px 8px rgba(0, 0, 0, 0.4);

    animation: ${slide} 0.3s ease-out;
  }
`;

const ClickOutside = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.3);
`;
