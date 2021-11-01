import { DonutIcon, LedgerIcon, TerraIcon } from '@station/ui';
import { Meta } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

export default {
  title: 'station/icons',
} as Meta;

export const Icons = () => {
  return (
    <IconLayout>
      <TerraIcon />
      <LedgerIcon />
      <DonutIcon ratio={0} />
      <DonutIcon ratio={0.25} />
      <DonutIcon ratio={0.5} />
      <DonutIcon ratio={0.75} />
      <DonutIcon ratio={1} />
    </IconLayout>
  );
};

const IconLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 24px);
  grid-template-rows: repeat(5, 24px);
  column-gap: 10px;
  row-gap: 10px;
  align-items: center;
`;
