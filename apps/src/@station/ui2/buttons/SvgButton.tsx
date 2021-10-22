import { fixHMR } from 'fix-hmr';
import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  forwardRef,
} from 'react';
import styled from 'styled-components';

export interface SvgButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  width: number | string;
  height: number | string;
}

const Component = forwardRef<HTMLButtonElement, SvgButtonProps>(
  ({ width, height, ...buttonProps }, ref) => {
    return <button {...buttonProps} ref={ref} />;
  },
);

const StyledComponent = styled(Component)`
  outline: none;
  border: none;
  background-color: transparent;
  padding: 0;

  cursor: pointer;

  color: inherit;

  svg {
    width: ${({ width }) => (typeof width === 'number' ? width + 'px' : width)};
    height: ${({ height }) =>
      typeof height === 'number' ? height + 'px' : height};
  }
`;

export const SvgButton = fixHMR(StyledComponent);
