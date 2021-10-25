import { Step } from '@station/ui2/layouts/Step';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { SubLayout } from 'webextension/components/layouts/SubLayout';

export default {
  title: 'station/layouts',
} as Meta;

export const Step_ = () => {
  const [value, setValue] = useState<number>(0);

  return (
    <SubLayout
      style={{ maxWidth: 400 }}
      title="Sub Layout"
      onBack={console.log}
      rightSection={
        <Step
          steps={['1', '2', '3']}
          selectedIndex={value}
          onChange={setValue}
        />
      }
    ></SubLayout>
  );
};
