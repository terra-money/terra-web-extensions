import { SearchTextInput } from '@station/ui2/form/SearchTextInput';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import styled from 'styled-components';

export default {
  title: 'station/form',
} as Meta;

export const SearchTextInput_ = () => {
  const [value, setValue] = useState<string>('');

  return (
    <Layout>
      <SearchTextInput
        placeholder="Search"
        value={value}
        onChange={({ currentTarget }) => setValue(currentTarget.value)}
      />
      <SearchTextInput
        placeholder="Search"
        disabled
        value={value}
        onChange={({ currentTarget }) => setValue(currentTarget.value)}
      />
      <SearchTextInput
        placeholder="Search"
        rightSection={<MdSearch />}
        value={value}
        onChange={({ currentTarget }) => setValue(currentTarget.value)}
      />
    </Layout>
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 20px;
  row-gap: 20px;
`;
