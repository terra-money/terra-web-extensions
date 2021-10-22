import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export interface ListBoxProps
  extends DetailedHTMLProps<
    HTMLAttributes<HTMLUListElement>,
    HTMLUListElement
  > {
  enableItemInteraction?: boolean;
}

function Component(ulProps: ListBoxProps) {
  return <ul {...ulProps} />;
}

export const listBoxStyle = css`
  background-color: var(--color-listbox-background);
  border: 1px solid var(--color-listbox-border);
  color: var(--color-listbox-text);

  border-radius: 8px;
`;

export const listBoxItemInteractionStyle = (enable?: boolean) => {
  return enable
    ? css`
        cursor: pointer;

        &:hover {
          background-color: var(--color-listbox-background-focused);
        }
      `
    : '';
};

const StyledComponent = styled(Component)`
  ${listBoxStyle};

  padding: 0;
  list-style: none;

  li {
    padding: 20px;
    font-size: 14px;

    ${({ enableItemInteraction = false }) =>
      listBoxItemInteractionStyle(enableItemInteraction)};

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-listbox-border);
    }

    &:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
`;

export const ListBox = fixHMR(StyledComponent);
