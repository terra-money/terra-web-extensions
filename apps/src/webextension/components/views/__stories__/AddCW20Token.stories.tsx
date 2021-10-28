import { Meta } from '@storybook/react';
import React from 'react';
import { AddCW20Token } from '../AddCW20Token';
import { ModalStoryContainer } from './components/ModalStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const AddCW20Token_ = () => {
  return (
    <ModalStoryContainer>
      <AddCW20Token
        existsTokens={new Set()}
        onAdd={console.log}
        onRemove={console.log}
        onClose={console.log}
      />
    </ModalStoryContainer>
  );
};
