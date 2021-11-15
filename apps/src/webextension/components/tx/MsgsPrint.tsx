import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { readMsg } from '@terra-money/msg-reader';
import { TxDescription } from '@terra-money/react-base-components';
import { Coins, Msg } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React, { useState } from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import styled from 'styled-components';

export interface MsgsPrintProps {
  className?: string;
  msgs: Msg[];
  walletAddress?: string;
  network: WebConnectorNetworkInfo;
  defaultOpen?: boolean;
}

function Component({
  className,
  msgs,
  walletAddress,
  network,
  defaultOpen = false,
}: MsgsPrintProps) {
  return (
    <ul className={className}>
      {msgs.map((msg, i) => (
        <MsgBlock
          key={'msg' + i}
          msg={msg}
          walletAddress={walletAddress}
          network={network}
          defaultOpen={defaultOpen}
        />
      ))}
    </ul>
  );
}

function MsgBlock({
  msg,
  walletAddress,
  network,
  defaultOpen = false,
}: { msg: Msg } & Pick<
  MsgsPrintProps,
  'walletAddress' | 'network' | 'defaultOpen'
>) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <li data-expanded={open}>
      <h3 onClick={() => setOpen((prev) => !prev)}>
        <span>
          <TxDescription
            network={{
              name: network.name,
              URL: network.lcd,
              chainID: network.chainID,
            }}
            config={{ showAllCoins: true, myWallet: walletAddress }}
            children={readMsg(msg)}
          />
        </span>
        {open ? <MdExpandLess /> : <MdExpandMore />}
      </h3>
      {open && (
        <ul>
          <li>
            <h4>type</h4>
            <p>{msg.toData()['@type']}</p>
          </li>
          {Object.entries(msg).map(([k, v], i) => {
            const dt = k;
            const dd =
              v instanceof Coins
                ? v.toString()
                : typeof v === 'object'
                ? JSON.stringify(v, null, 2)
                : v;

            return (
              <li key={i}>
                <h4>{dt}</h4>
                <pre>{dd}</pre>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

const StyledComponent = styled(Component)`
  list-style: none;
  padding: 0;

  font-size: 12px;

  --text-color: var(--color-form-text);
  --border-color: var(--color-form-border);
  --separator-color: var(--desaturated-300);

  color: var(--text-color);

  > li {
    &:not(:first-child) {
      margin-top: 10px;
    }

    border-radius: 8px;
    border: 1px solid var(--border-color);
    background-color: var(--white);

    h3 {
      padding: 0 15px;

      height: 45px;

      font-size: 1em;
      font-weight: normal;

      user-select: none;
      cursor: pointer;

      display: flex;
      justify-content: space-between;
      align-items: center;

      svg {
        font-size: 1.2em;
      }
    }

    ul {
      list-style: none;
      padding: 15px;

      li {
        h4 {
          margin-bottom: 5px;
        }

        p,
        pre {
          font-size: 1em;
        }

        &:not(:first-child) {
          padding-top: 10px;
          border-top: 1px solid var(--separator-color);
        }

        &:not(:last-child) {
          padding-bottom: 10px;
        }
      }
    }

    &[data-expanded='true'] {
      h3 {
        border-bottom: 1px solid var(--border-color);
      }
    }
  }
`;

export const MsgsPrint = fixHMR(StyledComponent);
