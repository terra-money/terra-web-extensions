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
        <div className="origin-message">
          <b>Original message:</b> {children}
        </div>
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
  background-color: var(--color-ledger-guide-background);
  border: 1px solid var(--color-ledger-guide-border);
  border-radius: 8px;

  font-size: 12px;
  line-height: 1.5;

  color: var(--color-ledger-guide-text);

  padding: 12px 15px;

  word-break: break-all;

  h3 {
    margin-bottom: 10px;
  }

  .origin-message {
    margin-top: 10px;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.05);

    padding: 15px;
  }
`;

export const LedgerGuide = fixHMR(StyledLedgerGuide);
