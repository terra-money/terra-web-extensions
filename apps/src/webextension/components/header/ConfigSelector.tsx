import { Divider, Menu } from '@mantine/core';
import { useMenuStyles } from '@station/ui2';
import { removeNetwork, selectNetwork } from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import {
  MdDeleteForever,
  MdLanguage,
  MdPodcasts,
  MdSettings,
} from 'react-icons/md';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useLocales } from 'webextension/contexts/locales';
import { useStore } from 'webextension/contexts/store';

export function ConfigSelector() {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const history = useHistory();

  const { classes: menuStyles } = useMenuStyles();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const { locale, locales, updateLocale } = useLocales();
  const { networks, selectedNetwork, defaultNetworks } = useStore();

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const onCreateNetwork = useCallback(() => {
    history.push('/networks/create');
  }, [history]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <Menu
      control={
        <MenuControl>
          <span>{selectedNetwork?.name}</span>
          <hr />
          <span>
            <FormattedMessage id={`locale.${locale}`} />
          </span>
          <MdSettings />
        </MenuControl>
      }
      placement="end"
      transition="scale-y"
      classNames={menuStyles}
    >
      <Menu.Label>
        <MdPodcasts style={{ transform: 'translateY(1px)' }} /> Network
      </Menu.Label>

      {networks.map((itemNetwork) => (
        <Menu.Item
          key={'network-' + itemNetwork.name}
          aria-selected={itemNetwork.name === selectedNetwork?.name}
          onClick={() => selectNetwork(itemNetwork)}
          rightSection={
            defaultNetworks.indexOf(itemNetwork) === -1 ? (
              <MdDeleteForever onClick={() => removeNetwork(itemNetwork)} />
            ) : undefined
          }
        >
          {itemNetwork.name[0].toUpperCase() + itemNetwork.name.substring(1)}
        </Menu.Item>
      ))}

      <Menu.Item onClick={onCreateNetwork}>Add a new network</Menu.Item>

      <Divider />

      <Menu.Label>
        <MdLanguage style={{ transform: 'translateY(1px)' }} /> Language
      </Menu.Label>

      {locales.map((itemLocale) => (
        <Menu.Item
          key={'locale-' + itemLocale}
          aria-selected={itemLocale === locale}
          onClick={() => updateLocale(itemLocale)}
        >
          <FormattedMessage id={'locale.' + itemLocale} />
        </Menu.Item>
      ))}
    </Menu>
  );
}

const MenuControl = styled.div`
  text-transform: uppercase;
  user-select: none;

  font-size: 10px;
  font-weight: 500;
  color: var(--color-header-text);

  display: flex;
  align-items: center;

  cursor: pointer;

  hr {
    width: 1px;
    height: 15px;
    border: 0;
    border-left: 1px solid var(--white);
    opacity: 0.2;
    margin: 0 10px;
  }

  svg {
    margin-left: 15px;
    width: 20px;
    height: 20px;
  }
`;
