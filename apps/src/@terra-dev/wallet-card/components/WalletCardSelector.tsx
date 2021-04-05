import { Add } from '@material-ui/icons';
import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { WalletBlankCard } from './WalletBlankCard';
import { WalletCardContainerProps } from './WalletCardContainer';

export interface CardSelectorProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>,
    'children' | 'onSelect'
  > {
  className?: string;
  cardWidth: number;
  children?:
    | ReactElement<WalletCardContainerProps>
    | ReactElement<WalletCardContainerProps>[]
    | null
    | undefined;
  selectedIndex: number;
  onSelect: (nextSelectedIndex: number) => void;
  onCreate: () => void;
}

function CardSelectorBase({
  cardWidth,
  children,
  selectedIndex,
  onSelect,
  onCreate,
  ...ulProps
}: CardSelectorProps) {
  const cards = useMemo(() => {
    if (!children) return null;

    const arrayedChildren = Array.isArray(children) ? children : [children];

    if (arrayedChildren.length === 0) return null;

    return arrayedChildren.map((card, i) => {
      const translateX = cardWidth * (i - selectedIndex);
      const scale = 1 - Math.abs((i - selectedIndex) * 0.2);
      const opacity = 1 - Math.abs((i - selectedIndex) * 0.4);

      return (
        <li
          key={'card' + i}
          onClick={() => selectedIndex !== i && onSelect(i)}
          style={{
            transform: `translateX(${translateX}px) scale(${scale})`,
            opacity,
            filter: Math.abs(i - selectedIndex) === 1 ? 'blur(2px)' : undefined,
            cursor: selectedIndex !== i ? 'pointer' : undefined,
          }}
        >
          {card}
        </li>
      );
    });
  }, [cardWidth, children, onSelect, selectedIndex]);

  return (
    <ul {...ulProps}>
      {cards ?? (
        <li onClick={onCreate} style={{ cursor: 'pointer' }}>
          <WalletBlankCard>
            <g transform="translate(350 190)">
              <g transform="translate(-100 -100)">
                <Add width="200" height="200" />
              </g>
            </g>
          </WalletBlankCard>
        </li>
      )}
    </ul>
  );
}

export const WalletCardSelector = styled(CardSelectorBase)`
  list-style: none;
  padding: 0;

  position: relative;

  min-width: ${({ cardWidth }) => cardWidth}px;
  max-width: ${({ cardWidth }) => cardWidth}px;
  height: 200px;

  > li {
    position: absolute;
    left: 0;
    top: 0;

    user-select: none;

    > svg {
      width: ${({ cardWidth }) => cardWidth}px;
    }

    will-change: transform, opacity, filter;
    transition: transform 0.3s ease-in-out, opacity 0.3s;
  }
`;
