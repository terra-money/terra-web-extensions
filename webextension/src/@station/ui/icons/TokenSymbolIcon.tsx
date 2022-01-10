import React, { useState } from 'react';
import styled from 'styled-components';

export interface TokenSymbolIconProps {
  className?: string;
  src: string | undefined;
  name: string;
  size: number;
}

export function TokenSymbolIcon({
  className,
  src,
  name,
  size,
}: TokenSymbolIconProps) {
  const [noIcon, setNoIcon] = useState<boolean>(false);

  if (!src || noIcon) {
    return (
      <AlternativeIcon className={className} size={size}>
        {name.length > 0 ? name[0] : '?'}
      </AlternativeIcon>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      onError={() => {
        setNoIcon(true);
      }}
    />
  );
}

const AlternativeIcon = styled.span<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  max-width: ${({ size }) => size}px;
  max-height: ${({ size }) => size}px;

  background-color: var(--color-content-text);
  color: var(--color-content-background);

  border-radius: 50%;

  display: grid;
  place-content: center;

  font-size: ${({ size }) => size * 0.65}px;
  text-transform: uppercase;
`;
