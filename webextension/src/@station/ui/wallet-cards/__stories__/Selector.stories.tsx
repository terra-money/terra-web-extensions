import { Menu } from '@mantine/core';
import {
  EmptyWalletCard,
  WalletCard,
  WalletCardSelector,
  WalletMoreMenus,
} from '@station/ui';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import {
  MdAddCircle,
  MdCallToAction,
  MdDelete,
  MdEdit,
  MdUpload,
  MdVpnKey,
} from 'react-icons/md';

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

function navItemRenderer(length: number, itemIndex: number) {
  return itemIndex >= length - 1 ? <MdAddCircle /> : <MdCallToAction />;
}

export const Selector = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <WalletCardSelector
      cardWidth={280}
      cardHeight={140}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      navItemRenderer={navItemRenderer}
      style={{
        width: '70%',
        height: 300,
        border: '1px solid red',
        margin: '0 auto',
      }}
    >
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

      <EmptyWalletCard>Create or recover a wallet</EmptyWalletCard>
    </WalletCardSelector>
  );
};
