import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import styled from 'styled-components';

export interface SvgIconProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  width: number | string;
  height: number | string;
}

function Component({ width, height, ...spanProps }: SvgIconProps) {
  return <span {...spanProps} />;
}

const StyledComponent = styled(Component)`
  svg {
    width: ${({ width }) => (typeof width === 'number' ? width + 'px' : width)};
    height: ${({ height }) =>
      typeof height === 'number' ? height + 'px' : height};
  }
`;

export const SvgIcon = fixHMR(StyledComponent);
