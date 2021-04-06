import { Tx } from '@terra-dev/tx';
import { Msg, MsgExecuteContract } from '@terra-money/terra.js';
import styled from 'styled-components';
import React, { useState } from 'react';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

export interface TxDetailProps {
  className?: string;
  tx?: Tx;
}

function TxDetailBase({ className, tx }: TxDetailProps) {
  return (
    <ul className={className}>
      {tx?.msgs.map((msg, i) => (
        <MsgBlock key={'msg' + i} msg={msg} />
      ))}
    </ul>
  );
}

function MsgBlock({ msg }: { msg: Msg }) {
  const [open, setOpen] = useState<boolean>(false);

  if (msg instanceof MsgExecuteContract) {
    return (
      <li>
        <h3 onClick={() => setOpen((prev) => !prev)}>
          <span>MsgExecuteContract</span>
          {open ? <ExpandLess /> : <ExpandMore />}
        </h3>
        {open && (
          <ul>
            <li>
              <h4>Sender</h4>
              <p>{msg.sender}</p>
            </li>
            <li>
              <h4>Contract</h4>
              <p>{msg.contract}</p>
            </li>
            <li>
              <h4>execute_msg</h4>
              <pre>{JSON.stringify(msg.execute_msg, null, 2)}</pre>
            </li>
            <li>
              <h4>Coins</h4>
              <p>{msg.coins.toJSON()}</p>
            </li>
          </ul>
        )}
      </li>
    );
  }

  return null;
}

export const TxDetail = styled(TxDetailBase)`
  list-style: none;
  padding: 0;

  margin: 20px 0;

  > li {
    &:not(:first-child) {
      margin-top: 10px;
    }

    border-radius: 8px;
    border: 1px solid #81a2cb;
    background-color: #f7fbff;

    padding: 10px;

    h3 {
      font-size: 1em;

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
      margin-top: 15px;

      list-style: none;
      padding: 0;

      li {
        h4 {
          margin-bottom: 5px;
        }

        p,
        pre {
          font-size: 1em;
        }

        &:not(:first-child) {
          margin-top: 10px;
        }
      }
    }
  }
`;
