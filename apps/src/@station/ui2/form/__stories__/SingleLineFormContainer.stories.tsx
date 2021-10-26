import { UST } from '@libs/types';
import { EmptyNumberInput } from '@libs/ui/form/EmptyNumberInput';
import {
  Button,
  FormSelect,
  FormSuggest,
  SingleLineFormContainer,
} from '@station/ui2';
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { MdOutlineFilterNone } from 'react-icons/md';
import styled from 'styled-components';

export default {
  title: 'station/form',
} as Meta;

const selectItems = [
  { label: 'LUNA', value: 'luna' },
  { label: 'UST', value: 'ust' },
  { label: 'ANC', value: 'anc' },
  { label: 'NEB', value: 'neb' },
];

export const SingleLineFormContainer_ = () => {
  const [value, setValue] = useState<string>('');
  const [amount, setAmount] = useState<UST>('' as UST);
  const [selectValue, setSelectValue] = useState<string>(
    () => selectItems[0].value,
  );

  const input = (
    <input
      placeholder="0.00"
      type="text"
      value={value}
      onChange={({ currentTarget }) => setValue(currentTarget.value)}
    />
  );

  const numberInput = (
    <EmptyNumberInput
      value={amount}
      onChange={setAmount}
      type="decimal"
      maxIntegerPoints={10}
      maxDecimalPoints={3}
    />
  );

  const suggest = (
    <FormSuggest
      label="Available:"
      amount="100,000"
      onClick={() => setAmount('100000' as UST)}
    />
  );

  const copy = (
    <Button size="tiny" variant="outline" leftIcon={<MdOutlineFilterNone />}>
      COPY
    </Button>
  );

  const sectionSelect = (
    <FormSelect
      data={selectItems}
      value={selectValue}
      onChange={setSelectValue}
    />
  );

  const sectionLabel = <span style={{ padding: '0 12px' }}>LUNA</span>;

  return (
    <Layout>
      <div>
        <SingleLineFormContainer label="Default">
          {input}
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Readonly" readOnly>
          {input}
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Disabled" disabled>
          {input}
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Invalid" invalid="Invalid message">
          {input}
        </SingleLineFormContainer>
      </div>

      <div>
        <SingleLineFormContainer
          label="Default"
          suggest={suggest}
          leftSection={sectionSelect}
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Readonly"
          suggest={suggest}
          leftSection={sectionSelect}
          readOnly
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Disabled"
          suggest={suggest}
          leftSection={sectionSelect}
          disabled
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Invalid"
          suggest={suggest}
          leftSection={sectionSelect}
          invalid="Invalid message"
        >
          {numberInput}
        </SingleLineFormContainer>
      </div>

      <div>
        <SingleLineFormContainer
          label="Default"
          suggest={copy}
          rightSection={sectionLabel}
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Readonly"
          suggest={copy}
          rightSection={sectionLabel}
          readOnly
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Disabled"
          suggest={copy}
          rightSection={sectionLabel}
          disabled
        >
          {numberInput}
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Invalid"
          suggest={copy}
          rightSection={sectionLabel}
          invalid="Invalid message"
        >
          {numberInput}
        </SingleLineFormContainer>
      </div>
    </Layout>
  );
};

const Layout = styled.div`
  max-width: 1000px;
  display: flex;
  gap: 20px;

  > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;
