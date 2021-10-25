import { fixHMR } from 'fix-hmr';
import React, { ReactElement, useMemo } from 'react';
import styled from 'styled-components';

export interface StepProps {
  className?: string;
  steps: (ReactElement | string)[];
  selectedIndex: number;
  onChange?: (nextSelectedIndex: number) => void;
}

function Component({ className, steps, selectedIndex, onChange }: StepProps) {
  const children = useMemo(() => {
    return steps.map((step, i) => {
      return (
        <li key={'item' + i} data-selected={selectedIndex === i}>
          <button onClick={onChange ? () => onChange(i) : undefined}>
            {step}
          </button>
        </li>
      );
    });
  }, [onChange, selectedIndex, steps]);

  return <ul className={className}>{children}</ul>;
}

const StyledComponent = styled(Component)`
  list-style: none;
  padding: 0;

  display: flex;
  gap: 15px;

  li {
    button {
      user-select: none;
      ${({ onChange }) =>
        typeof onChange === 'function' ? 'cursor: pointer' : ''};

      outline: none;
      border: none;

      width: 17px;
      max-width: 17px;
      height: 17px;
      max-height: 17px;

      display: grid;
      place-content: center;

      font-size: 10px;
      font-weight: bold;

      background-color: var(--color-header-text);
      color: var(--color-header-background);
      opacity: 0.3;

      transition: opacity 0.2s ease-in;

      border-radius: 50%;
    }

    &[data-selected='true'] {
      button {
        opacity: 1;
      }
    }

    position: relative;

    &:not(:last-child) {
      &::after {
        content: '';
        position: absolute;
        width: 15px;
        height: 1px;
        border-top: 1px solid var(--color-header-text);
        transform: translate(17px, -9px);
        opacity: 0.3;
      }
    }
  }
`;

export const Step = fixHMR(StyledComponent);
