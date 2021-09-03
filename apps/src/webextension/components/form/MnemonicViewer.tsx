import { MiniIconButton } from '@libs/station-ui';
import { TextField } from '@material-ui/core';
import { Check, FileCopy } from '@material-ui/icons';
import { MnemonicKey } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React from 'react';
import useCopyClipboard from 'react-use-clipboard';
import styled from 'styled-components';

export interface MnemonicViewerProps {
  className?: string;
  mk: MnemonicKey;
}

function MnemonicViewerBase({ className, mk }: MnemonicViewerProps) {
  const [isCopied, copy] = useCopyClipboard(mk.mnemonic, {
    successDuration: 1000 * 5,
  });

  return (
    <div className={className}>
      <TextField
        variant="outlined"
        readOnly
        multiline
        fullWidth
        type="text"
        size="small"
        label="Seed phrase"
        InputLabelProps={{ shrink: true }}
        value={mk.mnemonic}
      />
      <aside>
        <MiniIconButton onClick={copy}>
          {isCopied ? <Check /> : <FileCopy />}
        </MiniIconButton>
      </aside>
    </div>
  );
}

export const StyledMnemonicViewer = styled(MnemonicViewerBase)`
  position: relative;

  aside {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`;

export const MnemonicViewer = fixHMR(StyledMnemonicViewer);
