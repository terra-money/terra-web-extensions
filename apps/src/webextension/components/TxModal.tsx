import { Network } from '@terra-dev/network';
import { SerializedTx } from '@terra-dev/tx';
import React from 'react';
import styled from 'styled-components';

export interface TxModalProps {
  className?: string;
  src: string;
  terraAddress: string;
  network: Network;
  tx: SerializedTx;
  onClose: () => void;
}

function TxModalBase({
  className,
  src,
  terraAddress,
  network,
  tx,
  onClose,
}: TxModalProps) {
  const txBase64 = btoa(JSON.stringify(tx));
  const networkBase64 = btoa(JSON.stringify(network));

  return (
    <div className={className}>
      <section>
        <iframe
          title="Tx"
          src={`${src}?terraAddress=${terraAddress}&network=${networkBase64}&tx=${txBase64}`}
        ></iframe>
        <button onClick={onClose}>Close</button>
      </section>
    </div>
  );
}

export const TxModal = styled(TxModalBase)`
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
