import { Meta } from '@storybook/react';
import React from 'react';
import { InProgress } from '../InProgress';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const InProgress_ = () => {
  return (
    <PopupStoryContainer>
      <InProgress title="Searching for a ledger..." />
    </PopupStoryContainer>
  );
};
