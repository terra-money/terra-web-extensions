import { Meta } from '@storybook/react';
import { createMnemonicKey } from '@terra-dev/web-extension-backend';
import React from 'react';
import { ConfirmYourSeed } from '../ConfirmYourSeed';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

const mk = createMnemonicKey();

export const ConfirmYourSeed_ = () => {
  return (
    <PopupStoryContainer>
      <ConfirmYourSeed
        mk={mk}
        onValidate={console.log}
        onCancel={console.log}
      />
    </PopupStoryContainer>
  );
};
