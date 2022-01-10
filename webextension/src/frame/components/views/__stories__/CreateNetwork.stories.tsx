import { Meta } from '@storybook/react';
import React from 'react';
import { CreateNetwork } from '../CreateNetwork';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const CreateNetwork_ = () => {
  return (
    <PopupStoryContainer>
      <CreateNetwork
        networks={[
          {
            name: 'mainnet',
            chainID: 'columnbus-5',
            lcd: 'https://lcd.terra.dev',
          },
          {
            name: 'testnet',
            chainID: 'bombay-5',
            lcd: 'https://bombay-lcd.terra.dev',
          },
        ]}
        onCreate={console.log}
      />
    </PopupStoryContainer>
  );
};
