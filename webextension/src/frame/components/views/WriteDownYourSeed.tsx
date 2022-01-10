import { Checkbox, CheckboxStylesNames, Tooltip } from '@mantine/core';
import {
  Button,
  createMantineStyles,
  Message,
  SingleLineFormContainer,
  useTooltipStyles,
} from '@station/ui';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { useState } from 'react';
import { MdOutlineFilterNone } from 'react-icons/md';
import useCopyClipboard from 'react-use-clipboard';
import styled from 'styled-components';
import { FormMain } from 'frame/components/layouts/FormMain';
import { FormFooter } from '../layouts/FormFooter';

export interface WriteDownYourSeedProps {
  className?: string;
  mk: MnemonicKey;
  onConfirm: () => void;
}

export function WriteDownYourSeed({
  className,
  mk,
  onConfirm,
}: WriteDownYourSeedProps) {
  const [isCopied, copy] = useCopyClipboard(mk.mnemonic, {
    successDuration: 1000 * 5,
  });

  const [checked, setChecked] = useState<boolean>(false);

  const { classes: tooltipClasses } = useTooltipStyles();
  const { classes: checkboxClasses } = useCheckboxStyles();

  return (
    <div className={className}>
      <FormMain>
        <SingleLineFormContainer
          className={className}
          label="Seed phrase"
          readOnly
          suggest={
            <Tooltip
              label="Copied"
              withArrow
              arrowSize={3}
              opened={isCopied}
              classNames={tooltipClasses}
            >
              <Button
                size="tiny"
                variant="outline"
                leftIcon={<MdOutlineFilterNone />}
                onClick={copy}
              >
                COPY
              </Button>
            </Tooltip>
          }
        >
          <Viewer>{mk.mnemonic}</Viewer>
        </SingleLineFormContainer>

        <Message variant="danger">
          If you lose your seed phrase it's gone forever. Station doesn't store
          any data.
        </Message>

        <Checkbox
          classNames={checkboxClasses}
          checked={checked}
          onChange={({ currentTarget }) => setChecked(currentTarget.checked)}
          size="xs"
          label={
            <p>
              I have securely <strong>WRITTEN DOWN MY SEED</strong>. I
              understand that lost seeds cannot be recovered.
            </p>
          }
        />
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          disabled={!checked}
          onClick={onConfirm}
        >
          Next
        </Button>
      </FormFooter>
    </div>
  );
}

const Viewer = styled.div`
  color: var(--text-color);
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
`;

const useCheckboxStyles = createMantineStyles<CheckboxStylesNames>({
  root: {
    alignItems: 'start',
  },
  label: {
    paddingLeft: 8,
    color: 'var(--color-content-text)',
  },
});
