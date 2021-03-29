import { isTerraConnectMessage, MessageType } from 'extension/models/message';
import React, { useEffect } from 'react';

export interface TestKeysProps {}

export function TestKeys({}: TestKeysProps) {
  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (
        !isTerraConnectMessage(event.data) ||
        event.data.type !== MessageType.EXTENSION_STATE_UPDATED
      ) {
        return;
      }

      console.log('index.tsx..()', event.data.payload);
    });
  }, []);

  return <div>...</div>;
}
