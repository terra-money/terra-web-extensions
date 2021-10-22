import { fixHMR } from 'fix-hmr';
import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import styled from 'styled-components';

export interface WalletCardSelectorProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'children' | 'onSelect'
  > {
  cardWidth: number;
  cardHeight: number;
  children?: ReactElement | ReactElement[] | null | undefined;
  selectedIndex: number;
  onSelect: (nextSelectedIndex: number) => void;
  navItemRenderer?: (length: number, itemIndex: number) => ReactNode;
}

function Component({
  cardWidth,
  cardHeight,
  children,
  selectedIndex,
  onSelect,
  navItemRenderer,
  ...ulProps
}: WalletCardSelectorProps) {
  const cards = useMemo(() => {
    if (!children) return null;

    const arrayedChildren = Array.isArray(children) ? children : [children];

    if (arrayedChildren.length === 0) return null;

    return arrayedChildren.map((card, i) => {
      const isCenter = selectedIndex === i;
      const translateX =
        cardWidth * (i - selectedIndex) +
        (Math.abs(i - selectedIndex) > 1 ? (i - selectedIndex) * -15 : 0) +
        (Math.abs(i - selectedIndex) > 2 ? (i - selectedIndex) * -5 : 0);
      const scale = isCenter ? 1 : 0.8;

      return (
        <li
          key={'card' + i}
          onClick={isCenter ? undefined : () => onSelect(i)}
          data-is-center={selectedIndex === i}
          style={{
            transform: `translate(${translateX}px, 0) scale(${scale})`,
            opacity: isCenter ? 1 : 0.3,
            filter: isCenter ? undefined : 'blur(1px)',
            cursor: isCenter ? undefined : 'pointer',
          }}
        >
          {card}
        </li>
      );
    });
  }, [cardWidth, children, onSelect, selectedIndex]);

  return (
    <div {...ulProps}>
      <ul className="cards">{cards}</ul>
      {cards && cards.length > 0 && typeof navItemRenderer === 'function' && (
        <ul className="nav">
          {cards.map((_, i, arr) => (
            <li
              key={`nav${i}`}
              data-is-center={i === selectedIndex}
              onClick={() => onSelect(i)}
            >
              {navItemRenderer(arr.length, i)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const StyledComponent = styled(Component)`
  position: relative;

  .cards {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: ${({ cardWidth, cardHeight }) =>
      `translate(-${cardWidth / 2}px, -${cardHeight / 2}px)`};

    list-style: none;
    padding: 0;
    margin: 0;

    > li {
      position: absolute;

      will-change: transform, opacity, filter;
      transition: transform 0.3s ease-in-out, opacity 0.3s;

      user-select: none;

      > * {
        width: ${({ cardWidth }) => cardWidth}px;
        height: ${({ cardHeight }) => cardHeight}px;
      }

      &:not([data-is-center='true']) {
        * {
          pointer-events: none;
        }
      }
    }
  }

  .nav {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: ${({ cardHeight }) =>
      `translate(-50%, ${cardHeight / 2 + 10}px)`};

    list-style: none;
    padding: 0;

    color: white;
    font-size: 11px;

    display: flex;
    gap: 3px;

    li {
      opacity: 0.3;

      cursor: pointer;

      &[data-is-center='true'] {
        opacity: 1;
      }
    }
  }
`;

export const WalletCardSelector = fixHMR(StyledComponent);
