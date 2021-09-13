import { ledgerErrorGuides } from '@terra-dev/ledger-guide-messages';
import { fixHMR } from 'fix-hmr';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

export interface LedgerGuideProps {
  className?: string;
  code?: number;
  children: ReactNode;
}

function LedgerGuideBase({ className, code, children }: LedgerGuideProps) {
  if (typeof code !== 'number') {
    return <div className={className}>{children}</div>;
  }

  if (!!ledgerErrorGuides[code]) {
    return (
      <div className={className}>
        <h3>Ledger Error Code: {code}</h3>
        <div dangerouslySetInnerHTML={{ __html: ledgerErrorGuides[code] }} />
      </div>
    );
  }

  return (
    <div className={className}>
      <h3>{code}</h3>
      {children}
    </div>
  );
}

export const StyledLedgerGuide = styled(LedgerGuideBase)`
  border: 1px solid black;
  border-radius: 5px;

  word-break: break-all;
`;

export const LedgerGuide = fixHMR(StyledLedgerGuide);
