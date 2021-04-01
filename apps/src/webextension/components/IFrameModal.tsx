import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

export interface IFrameModalProps {
  className?: string;
  title: string;
  src: string;
  onClose: () => void;
}

function IFrameModalBase({ className, title, src, onClose }: IFrameModalProps) {
  const [[width, height], setSize] = useState<[number, number]>(() => [
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    function resize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={className}>
      <svg style={{ width, height }}>
        <circle className="bg" cx={width / 2} cy={height / 2} r={1000} />
        <circle className="wave1" cx={width / 2} cy={height / 2} r={1000} />
        <circle className="wave2" cx={width / 2} cy={height / 2} r={1000} />
        <circle className="wave3" cx={width / 2} cy={height / 2} r={1000} />
        <circle className="wave4" cx={width / 2} cy={height / 2} r={1000} />
      </svg>
      <section>
        <header>
          <button onClick={onClose}>Close</button>
        </header>
        <iframe title={title} src={src} frameBorder={0} />
      </section>
    </div>
  );
}

const circleEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
  
  30% {
    opacity: 0;
    transform: scale(0);
  }
  
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const circleWave1 = keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  
  40% {
    opacity: 1;
    transform: scale(0);
  }
  
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
`;

const circleWave2 = keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  
  43% {
    opacity: 1;
    transform: scale(0);
  }
  
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
`;

const circleWave3 = keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  
  48% {
    opacity: 1;
    transform: scale(0);
  }
  
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
`;

const circleWave4 = keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  
  54% {
    opacity: 1;
    transform: scale(0);
  }
  
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
`;

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

  svg {
    pointer-events: none;
    user-select: none;

    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;

    circle.bg {
      animation: ${circleEnter} 0.8s ease-out;
      fill: rgba(0, 0, 0, 0.4);
      transform-origin: center;
    }

    circle.wave1 {
      animation: ${circleWave1} 3s ease-out infinite;
      stroke-width: 10px;
      stroke: rgba(255, 255, 255, 0.1);
      transform-origin: center;
      fill: none;
    }

    circle.wave2 {
      animation: ${circleWave2} 3s ease-out infinite;
      stroke-width: 10px;
      stroke: rgba(255, 255, 255, 0.1);
      transform-origin: center;
      fill: none;
    }

    circle.wave3 {
      animation: ${circleWave3} 3s ease-out infinite;
      stroke-width: 10px;
      stroke: rgba(255, 255, 255, 0.1);
      transform-origin: center;
      fill: none;
    }

    circle.wave4 {
      animation: ${circleWave4} 3s ease-out infinite;
      stroke-width: 10px;
      stroke: rgba(255, 255, 255, 0.1);
      transform-origin: center;
      fill: none;
    }
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
