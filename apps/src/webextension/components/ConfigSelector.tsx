import {
  Button,
  ButtonProps,
  ClickAwayListener,
  Popper,
} from '@material-ui/core';
import { Language, WifiTethering } from '@material-ui/icons';
import { Network } from '@terra-dev/network';
import {
  observeNetworkStorage,
  removeNetwork,
  selectNetwork,
} from '@terra-dev/webextension-network-storage';
import React, { ComponentType, MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
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
            setAnchorElement(currentTarget);
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
            <ul>
              {networks.map((network) => (
                <li key={network.name}>
                  <span
                    onClick={() => {
                      selectNetwork(network);
                      setAnchorElement(null);
                    }}
                  >
                    [{network.name === selectedNetwork.name ? 'X' : ' '}]{' '}
                    {network.name} ({network.chainID})
                  </span>
                  {defaultNetworks.indexOf(network) === -1 && (
                    <button
                      onClick={() => {
                        removeNetwork(network);
                        setAnchorElement(null);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div>
              <Button
                onClick={() => {
                  history.push('/network/create');
                  setAnchorElement(null);
                }}
              >
                Add a new network
              </Button>
            </div>

            <ul>
              {locales.map((l) => (
                <li key={l}>
                  <span onClick={() => updateLocale(l)}>
                    [{l === locale ? 'X' : ' '}] {l}
                  </span>
                </li>
              ))}
            </ul>
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
        transform: translateY(0.2em);

        svg {
          font-size: 1.2em;
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

const DropdownContainer = styled.div`
  min-width: 260px;

  background-color: #ffffff;
  box-shadow: 0 0 21px 4px rgba(0, 0, 0, 0.3);
  border-radius: 15px;

  button {
    cursor: pointer;
  }
`;
