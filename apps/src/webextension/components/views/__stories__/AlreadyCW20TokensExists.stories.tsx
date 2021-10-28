import { Meta } from '@storybook/react';
import React from 'react';
import { AlreadyCW20TokensExists } from '../AlreadyCW20TokensExists';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const AlreadyCW20TokensExists_ = () => {
  return (
    <PopupStoryContainer>
      <AlreadyCW20TokensExists onConfirm={console.log} />
    </PopupStoryContainer>
  );
};
