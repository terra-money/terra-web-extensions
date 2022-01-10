import { Meta } from '@storybook/react';
import React from 'react';
import { CanNotFindTx } from '../CanNotFindTx';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const CanNotFindTx_ = () => {
  return (
    <PopupStoryContainer>
      <CanNotFindTx onConfirm={console.log} />
    </PopupStoryContainer>
  );
};
