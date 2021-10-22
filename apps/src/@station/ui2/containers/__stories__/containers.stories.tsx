import { Box, ListBox } from '@station/ui2';
import { Meta } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

export default {
  title: 'station/containers',
} as Meta;

export const Styles = () => {
  return (
    <Layout>
      <Box>Hello</Box>
      <ListBox enableItemInteraction>
        <li>A</li>
        <li>B</li>
        <li>C</li>
      </ListBox>
    </Layout>
  );
};

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
