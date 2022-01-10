import { Button } from '@station/ui';
import { Meta } from '@storybook/react';
import React from 'react';
import {
  MdAdd,
  MdCancel,
  MdCellWifi,
  MdChildFriendly,
  MdClearAll,
  MdDownload,
  MdSend,
  MdSwitchRight,
  MdUpdate,
} from 'react-icons/md';
import { HashRouter, Link } from 'react-router-dom';

export default {
  title: 'station/buttons',
} as Meta;

export const Button_ = () => {
  return (
    <div>
      <section>
        <h1 style={{ margin: '20px 0' }}>Size</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 150px 120px 100px 80px',
            columnGap: 20,
            alignItems: 'center',
          }}
        >
          <Button size="large" variant="primary">
            large
          </Button>
          <Button size="default" variant="primary">
            default
          </Button>
          <Button size="medium" variant="primary">
            medium
          </Button>
          <Button size="small" variant="primary">
            small
          </Button>
          <Button size="tiny" variant="primary">
            tiny
          </Button>
        </div>
      </section>

      <section>
        <h1 style={{ margin: '20px 0' }}>Variant</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 120px)',
            columnGap: 20,
            alignItems: 'center',
          }}
        >
          <Button variant="primary">primary</Button>
          <Button variant="danger">danger</Button>
          <Button variant="outline">outline</Button>
          <Button variant="dim">dim</Button>
        </div>
      </section>

      <section>
        <h1 style={{ margin: '20px 0' }}>Icons</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 150px)',
            columnGap: 20,
            rowGap: 20,
            alignItems: 'center',
          }}
        >
          <Button variant="primary" size="large" leftIcon={<MdDownload />}>
            Button
          </Button>

          <Button variant="danger" leftIcon={<MdClearAll />}>
            Button
          </Button>

          <Button variant="outline" size="medium" leftIcon={<MdSend />}>
            Button
          </Button>

          <Button variant="dim" size="small" leftIcon={<MdAdd />}>
            Button
          </Button>

          <Button variant="primary" size="tiny" leftIcon={<MdCellWifi />}>
            Button
          </Button>

          <Button variant="danger" rightIcon={<MdCancel />}>
            Button
          </Button>

          <Button variant="outline" size="medium" rightIcon={<MdSwitchRight />}>
            Button
          </Button>

          <Button variant="dim" size="small" rightIcon={<MdUpdate />}>
            Button
          </Button>

          <Button variant="outline" size="tiny" rightIcon={<MdChildFriendly />}>
            Button
          </Button>
        </div>
      </section>

      <section>
        <h1 style={{ margin: '20px 0' }}>Progress</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 140px)',
            columnGap: 20,
            alignItems: 'center',
          }}
        >
          <Button variant="primary" size="large" loading>
            primary
          </Button>
          <Button variant="danger" loading>
            danger
          </Button>
          <Button variant="outline" size="medium" loading>
            outline
          </Button>
          <Button variant="dim" size="small" loading>
            dim
          </Button>
          <Button variant="outline" size="tiny" loading>
            tiny
          </Button>
        </div>
      </section>
    </div>
  );
};

export const Button_Generic = () => {
  return (
    <HashRouter>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 150px)',
          columnGap: 20,
          alignItems: 'center',
        }}
      >
        <Button<'a'> component="a" href="https://google.com">
          Button
        </Button>

        <Button<Link> component={Link as any} to="/router-path">
          Button
        </Button>
      </div>
    </HashRouter>
  );
};
