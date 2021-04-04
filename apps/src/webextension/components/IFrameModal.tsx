import React from 'react';
import styled, { keyframes } from 'styled-components';
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
          <button onClick={onClose}>Close</button>
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
    transform: translateY(60px);
  }
`;

export const IFrameModal = styled(IFrameModalBase)`
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
    height: 640px;

    box-sizing: border-box;
    overflow: hidden;

    background-color: #0c3694;

    border-radius: 24px;

    display: grid;
    justify-content: right;
    align-items: start;

    animation: ${sectionEnter} 0.27s ease-in-out;

    header {
      padding: 20px;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
    }

    iframe {
      position: absolute;
      left: 0;
      top: 0;

      border-radius: 24px;

      box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.33);

      background-color: #ffffff;

      transform: translateY(60px);

      width: 400px;
      height: 640px;

      animation: ${iframeEnter} 0.5s ease-in;
    }
  }
`;
