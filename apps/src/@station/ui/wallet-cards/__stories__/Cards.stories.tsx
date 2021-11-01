import { Menu } from '@mantine/core';
import { EmptyWalletCard, WalletCard, WalletMoreMenus } from '@station/ui';
import { Meta } from '@storybook/react';
import React from 'react';
import { MdDelete, MdEdit, MdUpload, MdVpnKey } from 'react-icons/md';
import styled from 'styled-components';

export default {
  title: 'station/wallet-cards',
  parameters: {
    backgrounds: {
      default: 'header',
    },
  },
} as Meta;

const menus = (
  <WalletMoreMenus>
    <Menu.Item icon={<MdEdit />}>Edit wallet</Menu.Item>
    <Menu.Item icon={<MdVpnKey />}>Change password</Menu.Item>
    <Menu.Item icon={<MdUpload />}>Export wallet</Menu.Item>
    <Menu.Item icon={<MdDelete />}>Delete wallet</Menu.Item>
  </WalletMoreMenus>
);

export const Cards = () => {
  return (
    <Layout>
      <WalletCard
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
        showCopyTerraAddress
        onShowQRCode={console.log}
        design="terra"
      >
        {menus}
      </WalletCard>

      <WalletCard
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
        showCopyTerraAddress
        onShowQRCode={console.log}
        design="anchor"
      >
        {menus}
      </WalletCard>

      <WalletCard
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
        showCopyTerraAddress
        onShowQRCode={console.log}
        design="mirror"
      >
        {menus}
      </WalletCard>

      {['#00a9b4', '#00ae69', '#6c19fe', '#f55275', '#fea00d'].map((color) => (
        <WalletCard
          key={color}
          name="anchor-dev2"
          terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
          showCopyTerraAddress
          onShowQRCode={console.log}
          design={color}
        >
          {menus}
        </WalletCard>
      ))}

      <EmptyWalletCard>Create or recover a wallet</EmptyWalletCard>
    </Layout>
  );
};

const Layout = styled.div`
  display: flex;
  width: 90%;
  gap: 20px;
  flex-wrap: wrap;

  > * {
    width: 280px;
    height: 140px;
  }
`;
