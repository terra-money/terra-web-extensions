import { CircleButton } from '@station/ui';
import { Meta } from '@storybook/react';
import React from 'react';
import { MdDone, MdPlusOne, MdSearch } from 'react-icons/md';
import styled from 'styled-components';

export default {
  title: 'station/buttons',
} as Meta;

export const CircleButton_ = () => {
  return (
    <Layout>
      <h1>Styles</h1>
      <section>
        <CircleButton size={24} variant="primary">
          <MdSearch />
        </CircleButton>

        <CircleButton size={24} variant="danger">
          <MdSearch />
        </CircleButton>

        <CircleButton size={24} variant="dim">
          <MdSearch />
        </CircleButton>

        <CircleButton size={24} variant="outline">
          <MdSearch />
        </CircleButton>
      </section>

      <h1>Size</h1>
      <section>
        <CircleButton size={100} variant="primary">
          <MdSearch />
        </CircleButton>

        <CircleButton size={50} variant="danger">
          <MdSearch />
        </CircleButton>

        <CircleButton size={30} variant="dim">
          <MdSearch />
        </CircleButton>

        <CircleButton size={10} variant="outline">
          <MdSearch />
        </CircleButton>
      </section>

      <h1>Icons</h1>
      <section>
        {[<MdSearch />, <MdPlusOne />, <MdDone />, '+', 'A', '1'].map(
          (content, i) => (
            <CircleButton key={i} size={24} variant="dim">
              {content}
            </CircleButton>
          ),
        )}
      </section>
    </Layout>
  );
};

const Layout = styled.div`
  h1 {
    margin: 20px 0;
  }

  section {
    display: flex;
    align-items: center;
    gap: 20px;
  }
`;
