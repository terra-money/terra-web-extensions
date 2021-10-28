import { Meta } from '@storybook/react';
import React from 'react';
import { ApproveHostname } from '../ApproveHostname';
import { PopupStoryContainer } from './components/PopupStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const ApproveHostname_ = () => {
  return (
    <PopupStoryContainer>
      <ApproveHostname
        hostname="app.anchorprotocol.com"
        onCancel={console.log}
        onConfirm={console.log}
      />
    </PopupStoryContainer>
  );
};
