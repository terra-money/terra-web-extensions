import { Meta } from '@storybook/react';
import React from 'react';
import { CanNotFindWallet } from '../CanNotFindWallet';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const CanNotFindWallet_ = () => {
  return (
    <PopupStoryContainer>
      <CanNotFindWallet
        chainID="bombay-12"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
        onConfirm={console.log}
      />
    </PopupStoryContainer>
  );
};
