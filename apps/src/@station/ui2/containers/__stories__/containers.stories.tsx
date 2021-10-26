import { Box, Button, ListBox } from '@station/ui2';
import { Modal } from '@station/ui2/containers/Modal';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import styled from 'styled-components';

export default {
  title: 'station/containers',
} as Meta;

export const Styles = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <Layout>
      <Box>Hello</Box>
      <ListBox enableItemInteraction>
        <li>A</li>
        <li>B</li>
        <li>C</li>
      </ListBox>
      <Button onClick={() => setOpenModal((prev) => !prev)}>Open Modal</Button>
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <ModalContent>Test Content</ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

const ModalContent = styled.div`
  width: 300px;
  height: 240px;

  display: grid;
  place-content: center;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
