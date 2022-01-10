import {
  Box,
  Button,
  IFramePoppingModal,
  ListBox,
  Modal,
  PoppingModal,
  SvgIcon,
} from '@station/ui';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import styled from 'styled-components';

export default {
  title: 'station/containers',
} as Meta;

export const Box_ = () => {
  return <Box>Hello</Box>;
};

export const ListBox_ = () => {
  return (
    <ListBox enableItemInteraction>
      <li>A</li>
      <li>B</li>
      <li>C</li>
    </ListBox>
  );
};

export const Modal_ = () => {
  const [openModal, setOpenModal] = useState<boolean>(true);

  return (
    <>
      <Button onClick={() => setOpenModal((prev) => !prev)}>Open Modal</Button>
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <ModalContent>Test Content</ModalContent>
        </Modal>
      )}
    </>
  );
};

export const PoppingModal_Title = () => {
  const [openModal, setOpenModal] = useState<boolean>(true);

  return (
    <>
      <Button onClick={() => setOpenModal((prev) => !prev)}>Open Modal</Button>
      {openModal && (
        <PoppingModal
          logo={
            <SvgIcon width={24} height={24}>
              <MdSportsSoccer />
            </SvgIcon>
          }
          title="Test Popping Modal"
          onClose={() => setOpenModal(false)}
          width="600px"
          height="70vh"
          maxHeight="600px"
        >
          <ModalContent>Test Content</ModalContent>
        </PoppingModal>
      )}
    </>
  );
};

export const PoppingModal_ = () => {
  const [openModal, setOpenModal] = useState<boolean>(true);

  return (
    <>
      <Button onClick={() => setOpenModal((prev) => !prev)}>Open Modal</Button>
      {openModal && (
        <PoppingModal
          logo={
            <SvgIcon width={24} height={24}>
              <MdSportsSoccer />
            </SvgIcon>
          }
          onClose={() => setOpenModal(false)}
          width="600px"
          height="70vh"
          maxHeight="600px"
        >
          <ModalContent>Test Content</ModalContent>
        </PoppingModal>
      )}
    </>
  );
};

export const IFramePoppingModal_ = () => {
  const [openModal, setOpenModal] = useState<boolean>(true);

  return (
    <>
      <Button onClick={() => setOpenModal((prev) => !prev)}>Open Modal</Button>
      {openModal && (
        <IFramePoppingModal
          logo={
            <SvgIcon width={24} height={24}>
              <MdSportsSoccer />
            </SvgIcon>
          }
          onClose={() => setOpenModal(false)}
          width="600px"
          height="70vh"
          maxHeight="600px"
          src="https://station.terra.money"
        />
      )}
    </>
  );
};

const ModalContent = styled.div`
  min-width: 300px;
  height: 240px;

  display: grid;
  place-content: center;
`;
