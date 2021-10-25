import { SvgIcon } from '@station/ui2';
import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import styled, { css } from 'styled-components';

export type MessageVariant = 'danger' | 'warning' | 'success';

export interface MessageProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  variant?: MessageVariant;
  icon?: ReactNode;
}

function Component({ variant, icon, children, ...divProps }: MessageProps) {
  return (
    <div {...divProps}>
      <SvgIcon width={18} height={18}>
        {icon ?? variant === 'success' ? <MdCheckCircle /> : <MdError />}
      </SvgIcon>
      <div>{children}</div>
    </div>
  );
}

const messageStyles = (variant: MessageVariant = 'success') => {
  return css`
    background-color: var(--color-message-${variant}-background);
    color: var(--color-message-${variant}-text);
  `;
};

const StyledComponent = styled(Component)`
  ${({ variant }) => messageStyles(variant)};

  padding: 8px 8px 5px 8px;

  font-size: 12px;
  line-height: 1.5;

  display: flex;
  gap: 8px;

  border-radius: 5px;

  vertical-align: middle;
`;

export const Message = fixHMR(StyledComponent);
