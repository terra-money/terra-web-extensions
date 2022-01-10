import { Meta } from '@storybook/react';
import React from 'react';
import { ManageCW20Tokens } from '../ManageCW20Tokens';
import { ModalStoryContainer } from './components/ModalStoryContainer';

export default {
  title: 'webextension/views',
} as Meta;

export const ManageCW20Tokens_ = () => {
  return (
    <ModalStoryContainer>
      <ManageCW20Tokens
        initialTokens={[
          'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x',
          'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc',
          'terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl',
        ]}
        existsTokens={new Set(['terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc'])}
        onAdd={console.log}
        onRemove={console.log}
        onClose={console.log}
      />
    </ModalStoryContainer>
  );
};
