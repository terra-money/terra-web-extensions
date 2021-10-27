import { Close } from '@material-ui/icons';
import React, { cloneElement, ReactElement, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../../assets/Logo.svg';

export interface ModalProps {
  className?: string;
  width?: number;
  height?: number;
  children: ReactElement;
  onClose: () => void;
  onOutboundClick?: () => void;
  headerTitle?: ReactNode;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 550;
const HEADER_HEIGHT = 50;
const HEADER_PADDING = 20;

function ModalBase({
  className,
  children,
  onClose,
  onOutboundClick,
  headerTitle,
}: ModalProps) {
  return (
    <div className={className}>
      <div className="dim" onClick={onOutboundClick} />
      <section>
        <header>
          {headerTitle ?? (
            <i className="logo">
              <Logo />
            </i>
          )}
          <button onClick={onClose}>
            <Close style={{ color: '#ffffff' }} />
          </button>
        </header>
        {cloneElement(children, {
          className: 'content',
        })}
      </section>
    </div>
  );
}

const sectionEnter = keyframes`
  0% {
    opacity: 0.3;
    transform: translate(-50%, -20%);
  }
  
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

const contentEnter = keyframes`
  0% {
    transform: translateY(0);
  }
  
  30% {
    transform: translateY(0);
  }
  
  100% {
    transform: translateY(${HEADER_HEIGHT}px);
  }
`;

/** @deprecated */
export const Modal = styled(ModalBase)`
  all: initial;

  position: fixed;
  z-index: 100000;

  > .dim {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;

    background-color: rgba(0, 0, 0, 0.4);
  }

  > section {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    box-shadow: 0 4px 18px 3px rgba(0, 0, 0, 0.43);

    width: ${({ width = DEFAULT_WIDTH }) => width}px;
    height: ${({ height = DEFAULT_HEIGHT }) => height + HEADER_HEIGHT}px;

    box-sizing: border-box;
    overflow: hidden;

    background-color: #0c3694;

    border-radius: 24px;

    animation: ${sectionEnter} 0.27s ease-in-out;

    header {
      height: ${HEADER_HEIGHT}px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      padding: 0 ${HEADER_PADDING}px;

      color: #ffffff;

      .logo {
        color: currentColor;
        font-size: 0;

        svg {
          color: currentColor;
          width: 100px;
        }
      }

      button {
        border: none;
        outline: none;
        background-color: transparent;
        padding: 0;
        cursor: pointer;

        font-size: 16px;

        svg {
          font-size: 1em;
        }
      }
    }

    .content {
      position: absolute;
      left: 0;
      top: 0;

      border-radius: 24px;

      box-shadow: 0 4px 18px 3px rgba(0, 0, 0, 0.33);

      background-color: #ffffff;

      transform: translateY(${HEADER_HEIGHT}px);

      width: ${({ width = DEFAULT_WIDTH }) => width}px;
      height: ${({ height = DEFAULT_HEIGHT }) => height}px;

      animation: ${contentEnter} 0.5s ease-in;
    }
  }
`;
