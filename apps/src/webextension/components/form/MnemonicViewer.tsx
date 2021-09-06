import { Check, CloudDownload, FileCopy } from '@material-ui/icons';
import { FormLabel, FormLabelAside, MiniButton, TextInput } from '@station/ui';
import { MnemonicKey } from '@terra-money/terra.js';
import { fixHMR } from 'fix-hmr';
import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';
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

  const data = useMemo(() => {
    const rows: string[][] = [['', '', '', '', '']];
    const words = mk.mnemonic.split(' ');
    let i: number = 0;
    const max: number = words.length;
    while (i < max) {
      rows.push(words.slice(i, i + 5));
      i += 5;
    }
    return rows;
  }, [mk.mnemonic]);

  return (
    <FormLabel
      className={className}
      label="Seed phrase"
      aside={
        <FormLabelAside>
          <MiniButton onClick={copy} style={{ marginRight: 5 }}>
            {isCopied ? <Check /> : <FileCopy />} Copy
          </MiniButton>
          <MiniButton component={CSVLink} data={data}>
            <CloudDownload /> Download
          </MiniButton>
        </FormLabelAside>
      }
    >
      <TextInput fullWidth readOnly multiline value={mk.mnemonic} />
    </FormLabel>
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
