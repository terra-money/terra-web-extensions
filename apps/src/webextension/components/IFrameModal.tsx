import React from 'react';
import styled from 'styled-components';

export interface IFrameModalProps {
  className?: string;
  title: string;
  src: string;
  onClose: () => void;
}

function IFrameModalBase({ className, title, src, onClose }: IFrameModalProps) {
  return (
    <div className={className}>
      <section>
        <iframe title={title} src={src}></iframe>
        <button onClick={onClose}>Close</button>
      </section>
    </div>
  );
}

export const IFrameModal = styled(IFrameModalBase)`
  position: fixed;
  box-sizing: border-box;

  left: 0;
  top: 0;

  background-color: rgba(0, 0, 0, 0.2);

  width: 100vw;
  height: 100vh;

  padding: 30px;

  section {
    box-sizing: border-box;

    display: grid;
    justify-content: right;
    align-items: start;

    iframe {
      background-color: #ffffff;

      width: 400px;
      height: 600px;
    }
  }
`;
