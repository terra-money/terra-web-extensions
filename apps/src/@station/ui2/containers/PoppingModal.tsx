import { fixHMR } from 'fix-hmr';
import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import { MdClose } from 'react-icons/md';
import styled, { keyframes } from 'styled-components';
import { SvgButton } from '../buttons/SvgButton';

export interface PoppingModalProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'title' | 'children'
  > {
  logo: ReactNode;
  title?: ReactNode;
  children: ReactElement;
  onClose?: (from: 'close' | 'outbound-click') => void;
  width: `${number}px` | `${number}vw`;
  height: `${number}px` | `${number}vh`;
  maxHeight?: `${number}px`;
}

function Component({
  logo,
  title,
  children,
  onClose,
  width,
  height,
  maxHeight,
  ...divProps
}: PoppingModalProps) {
  return (
    <div {...divProps} data-has-title={!!title}>
      <div
        className="dim"
        onClick={onClose ? () => onClose('outbound-click') : undefined}
      />
      <section>
        <header>
          <div className="logo-wrapper">
            {logo}
            {onClose && (
              <SvgButton
                width={24}
                height={24}
                onClick={() => onClose('close')}
              >
                <MdClose />
              </SvgButton>
            )}
          </div>
          {title && <h1>{title}</h1>}
        </header>
        <main>{children}</main>
      </section>
    </div>
  );
}

const enter = keyframes`
  0% {
    opacity: 0.3;
    transform: translate(-50%, -20%);
  }
  
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

const StyledComponent = styled(Component)`
  all: initial;
  font-family: sans-serif;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    font-family: var(--font-family);
  }

  position: fixed;
  z-index: 100000;

  --header-height: 116px;

  &[data-has-title='false'] {
    --header-height: 62px;
  }

  > .dim {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;

    background-color: rgba(0, 0, 0, 0.4);
  }

  > section {
    width: ${({ width }) => width};
    height: ${({ height }) => height};
    ${({ maxHeight }) => (maxHeight ? `max-height: ${maxHeight}` : '')};

    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    box-shadow: 0 4px 18px 3px rgba(0, 0, 0, 0.43);

    box-sizing: border-box;
    overflow: hidden;

    border-radius: 16px;

    animation: ${enter} 0.27s ease-in-out;

    display: flex;
    flex-direction: column;

    > header {
      height: var(--header-height);
      min-height: var(--header-height);
      max-height: var(--header-height);

      padding: 20px 20px 0 20px;

      background-color: #0b132f;
      color: #459cf4;

      .logo-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      h1 {
        margin: 16px 0 0 0;

        font-size: 24px;
        font-weight: bold;
        line-height: 1.5;
      }
    }

    > main {
      flex: 1;
      background-color: #f9faff;

      iframe {
        background-color: #0b132f;
      }
    }
  }
`;

export const PoppingModal = fixHMR(StyledComponent);
