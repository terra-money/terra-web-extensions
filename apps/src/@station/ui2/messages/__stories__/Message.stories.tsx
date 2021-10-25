import { Message } from '@station/ui2/messages/Message';
import { Meta } from '@storybook/react';
import React from 'react';

export default {
  title: 'station/messages',
} as Meta;

export const Message_ = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Message variant="danger">An example danger message</Message>
      <Message variant="warning">An example warning message</Message>
      <Message variant="success">An example succeess message</Message>
      <Message variant="danger">
        <p>Multiline message</p>
        <p>Multiline message</p>
        <p>Multiline message</p>
      </Message>
    </div>
  );
};
