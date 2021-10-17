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
  OpenInBrowser,
  WifiTethering,
} from '@material-ui/icons';
import { LinedList } from '@station/ui';
import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { removeNetwork, selectNetwork } from '@terra-dev/web-extension-backend';
import React, { ComponentType, MouseEvent, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useLocales } from 'webextension/contexts/locales';
import { useStore } from 'webextension/contexts/store';
import { LanguageCode } from 'webextension/locales';
import { extensionPath } from 'webextension/logics/extensionPath';

const INDEX = extensionPath('index.html');

export function ConfigSelectorBase({
  className,
  showIndexLink = false,
}: {
  className?: string;
  showIndexLink?: boolean;
}) {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const history = useHistory();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const { locale, locales, updateLocale } = useLocales();
  const { networks, selectedNetwork, defaultNetworks } = useStore();

  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const dropdownOpened = !!anchorElement;

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const onToggleDropdown = useCallback(
    ({ currentTarget }: MouseEvent<HTMLElement>) => {
      setAnchorElement((prev) => (prev ? null : currentTarget));
    },
    [],
  );

  const onSelectNetwork = useCallback(
    (nextNetwork: WebConnectorNetworkInfo) => {
      selectNetwork(nextNetwork);
      setAnchorElement(null);
    },
    [],
  );

  const onRemoveNetwork = useCallback(
    (targetNetwork: WebConnectorNetworkInfo) => {
      removeNetwork(targetNetwork);
      setAnchorElement(null);
    },
    [],
  );

  const onCreateNetwork = useCallback(() => {
    history.push('/networks/create');
    setAnchorElement(null);
  }, [history]);

  const onSelectLocale = useCallback(
    (nextLocale: LanguageCode) => {
      updateLocale(nextLocale);
      setAnchorElement(null);
    },
    [updateLocale],
  );

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <ClickAwayListener onClickAway={() => setAnchorElement(null)}>
      <div className={className}>
        <AnchorButton onClick={onToggleDropdown}>
          <div>
            <i>
              <WifiTethering />
            </i>
            <span>{selectedNetwork?.name}</span>
            <i>
              <Language />
            </i>
            <span>
              <FormattedMessage id={`locale.${locale}`} />
            </span>
          </div>
        </AnchorButton>

        <Popper
          open={dropdownOpened}
          anchorEl={anchorElement}
          placement="bottom"
        >
          <DropdownContainer>
            <LinedList>
              {networks.map((itemNetwork) => (
                <li
                  key={itemNetwork.name}
                  data-selected={itemNetwork.name === selectedNetwork?.name}
                >
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectNetwork(itemNetwork)}
                  >
                    <i>
                      <WifiTethering />
                    </i>
                    <span>{itemNetwork.name}</span>
                  </div>
                  {defaultNetworks.indexOf(itemNetwork) === -1 && (
                    <button onClick={() => onRemoveNetwork(itemNetwork)}>
                      <DeleteForever />
                    </button>
                  )}
                </li>
              ))}
              <li data-selected="false">
                <div style={{ cursor: 'pointer' }} onClick={onCreateNetwork}>
                  <i>
                    <AddCircleOutline />
                  </i>
                  <span>Add a new network</span>
                </div>
              </li>
            </LinedList>

            <hr />

            <LinedList>
              {locales.map((itemLocale) => (
                <li key={itemLocale} data-selected={itemLocale === locale}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectLocale(itemLocale)}
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

            {showIndexLink && (
              <>
                <hr />

                <LinedList>
                  <li>
                    <a href={INDEX} target="terra-station" rel="noreferrer">
                      <i>
                        <OpenInBrowser />
                      </i>
                      <span>Open Terra Station</span>
                    </a>
                  </li>
                </LinedList>
              </>
            )}
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

  hr {
    margin: 0.5em -13px;
    border: 0;
    border-bottom: 1px solid #eeeeee;
  }
`;
