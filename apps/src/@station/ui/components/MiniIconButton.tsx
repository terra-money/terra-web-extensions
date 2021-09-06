import { IconButton, IconButtonProps } from '@material-ui/core';
import { ComponentType } from 'react';
import styled from 'styled-components';

export const MiniIconButton: ComponentType<IconButtonProps> = styled(
  IconButton,
).attrs({
  size: 'small',
})`
  outline: none;

  border: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;

  cursor: pointer;

  user-select: none;

  font-size: 10px;
  font-weight: 300;
  text-align: center;

  color: #aaaaaa;
  background-color: #eeeeee;

  svg {
    font-size: 1em;
  }

  &:hover {
    color: #777777;
    background-color: #e5e5e5;
  }

  &:active {
    color: #777777;
    background-color: #e5e5e5;
  }

  &:disabled {
    opacity: 0.3;
  }
` as any;
