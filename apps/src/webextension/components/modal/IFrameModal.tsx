import { Close } from '@material-ui/icons';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../../assets/Logo.svg';
import { contentHeight, headerHeight, headerPadding } from '../../env';
import { WaveEffect } from './WaveEffect';

export interface IFrameModalProps {
  className?: string;
  title: string;
  src: string;
  onClose: () => void;
}

function IFrameModalBase({ className, title, src, onClose }: IFrameModalProps) {
  return (
    <div className={className}>
      <WaveEffect />
      <section>
        <header>
          <i className="logo">
            <Logo />
          </i>
          <button onClick={onClose}>
            <Close style={{ color: '#ffffff' }} />
          </button>
        </header>
        <iframe title={title} src={src} frameBorder={0} />
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

const iframeEnter = keyframes`
  0% {
    transform: translateY(0);
  }
  
  30% {
    transform: translateY(0);
  }
  
  100% {
    transform: translateY(${headerHeight}px);
  }
`;

export const IFrameModal = styled(IFrameModalBase)`
  all: initial;

  position: fixed;
  z-index: 100000;

  div {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }

  section {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.43);

    width: 400px;
    height: ${headerHeight + contentHeight}px;

    box-sizing: border-box;
    overflow: hidden;

    background-color: #0c3694;

    border-radius: 24px;

    animation: ${sectionEnter} 0.27s ease-in-out;

    header {
      height: ${headerHeight}px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      padding: 0 ${headerPadding}px;

      .logo {
        color: #ffffff;
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

    iframe {
      position: absolute;
      left: 0;
      top: 0;

      border-radius: 24px;

      box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.33);

      background-color: #ffffff;

      transform: translateY(${headerHeight}px);

      width: 400px;
      height: ${contentHeight}px;

      animation: ${iframeEnter} 0.5s ease-in;
    }
  }
`;
