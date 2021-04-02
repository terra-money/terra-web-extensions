import React from 'react';
import styled from 'styled-components';

export interface PopupHeaderProps {
  className?: string;
}

function PopupHeaderBase({ className }: PopupHeaderProps) {
  return <header className={className}>...</header>;
}

export const PopupHeader = styled(PopupHeaderBase)`
  z-index: -100;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
`;
