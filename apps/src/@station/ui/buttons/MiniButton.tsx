import { Button, ButtonProps } from '@material-ui/core';
import { ComponentType } from 'react';
import styled from 'styled-components';

export const MiniButton: ComponentType<ButtonProps> = styled(Button).attrs({
  size: 'small',
})`
  outline: none;

  border: 0;
  height: 20px;
  border-radius: 15px;

  cursor: pointer;

  user-select: none;

  font-size: 10px;
  font-weight: 300;
  text-align: center;

  color: #aaaaaa;
  background-color: #eeeeee;

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

  .MuiButton-startIcon {
    margin-right: 4px;
  }

  .MuiButton-iconSizeSmall > *:first-child {
    font-size: 1em;
  }
` as any;
