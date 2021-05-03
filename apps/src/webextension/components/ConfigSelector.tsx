import {
  Button,
  ButtonProps,
  ClickAwayListener,
  Popper,
} from '@material-ui/core';
import {
  AddCircleOutline,
  DeleteForever,
  Language,
  WifiTethering,
} from '@material-ui/icons';
import { LinedList } from '@terra-dev/station-ui/components/LinedList';
import { Network } from '@terra-dev/web-extension';
import {
  observeNetworkStorage,
  removeNetwork,
  selectNetwork,
} from '@terra-dev/web-extension/backend';
import React, { ComponentType, MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useLocales } from 'webextension/contexts/locales';
import { defaultNetworks } from '../env';

export function ConfigSelectorBase({ className }: { className?: string }) {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const history = useHistory();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const { locale, locales, updateLocale } = useLocales();

  const [networks, setNetworks] = useState<Network[]>(defaultNetworks);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(
    () => defaultNetworks[0],
  );

  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const openDropdown = !!anchorElement;

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  useEffect(() => {
    const subscription = observeNetworkStorage().subscribe(
      ({ networks: nextNetworks, selectedNetwork: nextSelectedNetwork }) => {
        setNetworks([...defaultNetworks, ...nextNetworks]);
        setSelectedNetwork(nextSelectedNetwork ?? defaultNetworks[0]);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <ClickAwayListener onClickAway={() => setAnchorElement(null)}>
      <div className={className}>
        <AnchorButton
          onClick={({ currentTarget }: MouseEvent<HTMLElement>) => {
            setAnchorElement((prev) => (prev ? null : currentTarget));
          }}
        >
          <div>
            <i>
              <WifiTethering />
            </i>
            <span>{selectedNetwork.name}</span>
            <i>
              <Language />
            </i>
            <span>
              <FormattedMessage id={`locale.${locale}`} />
            </span>
          </div>
        </AnchorButton>

        <Popper open={openDropdown} anchorEl={anchorElement} placement="bottom">
          <DropdownContainer>
            <h2>Network</h2>

            <LinedList>
              {networks.map((itemNetwork) => (
                <li
                  key={itemNetwork.name}
                  data-selected={itemNetwork.name === selectedNetwork.name}
                >
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      selectNetwork(itemNetwork);
                      setAnchorElement(null);
                    }}
                  >
                    <i>
                      <WifiTethering />
                    </i>
                    <span>{itemNetwork.name}</span>
                  </div>
                  {defaultNetworks.indexOf(itemNetwork) === -1 && (
                    <button
                      onClick={() => {
                        removeNetwork(itemNetwork);
                        setAnchorElement(null);
                      }}
                    >
                      <DeleteForever />
                    </button>
                  )}
                </li>
              ))}
              <li data-selected="false">
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    history.push('/network/create');
                    setAnchorElement(null);
                  }}
                >
                  <i>
                    <AddCircleOutline />
                  </i>
                  <span>Add a new network</span>
                </div>
              </li>
            </LinedList>

            <h2>Language</h2>

            <LinedList>
              {locales.map((itemLocale) => (
                <li key={itemLocale} data-selected={itemLocale === locale}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      updateLocale(itemLocale);
                      setAnchorElement(null);
                    }}
                  >
                    <i>
                      <Language />
                    </i>
                    <span>
                      <FormattedMessage id={'locale.' + itemLocale} />
                    </span>
                  </div>
                </li>
              ))}
            </LinedList>
          </DropdownContainer>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}

export const AnchorButton: ComponentType<ButtonProps> = styled(Button)`
  && {
    color: #ffffff;
    font-size: 12px;
    font-weight: normal;
    text-transform: none;

    div {
      display: flex;
      align-items: center;

      i {
        svg {
          font-size: 1.2em;
          transform: translateY(0.2em);
        }

        margin-right: 0.3em;

        &:nth-of-type(2) {
          margin-left: 1em;
        }
      }

      span:first-letter {
        text-transform: uppercase;
      }
    }
  }
`;

export const ConfigSelector = styled(ConfigSelectorBase)`
  position: relative;
  display: inline-block;
`;

const dropdownEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(1, 0.4);
  }
  
  100% {
    opacity: 1;
    transform: scale(1, 1);
  }
`;

const DropdownContainer = styled.div`
  min-width: 200px;

  font-size: 13px;

  background-color: #ffffff;
  box-shadow: 0 0 21px 4px rgba(0, 0, 0, 0.3);
  border-radius: 12px;

  padding: 1em;

  transform-origin: top;
  animation: ${dropdownEnter} 0.1s ease-out;

  h2 {
    font-size: 1.2em;
    font-weight: normal;
    text-align: center;

    margin-bottom: 0.5em;

    &:not(:first-child) {
      margin-top: 1.2em;
    }
  }
`;
