import React, { ReactNode } from 'react';
import { RotateSpinner } from 'react-spinners-kit';
import styled from 'styled-components';
import { FormMain } from 'webextension/components/layouts/FormMain';

export interface InProgressProps {
  className?: string;
  children: ReactNode;
}

export function InProgress({ className, children }: InProgressProps) {
  return (
    <div className={className}>
      <FormMain>
        <CenterLayout>
          <RotateSpinner size={48} color="#2043b5" />
          <p>{children}</p>
        </CenterLayout>
      </FormMain>
    </div>
  );
}

const CenterLayout = styled.div`
  margin-top: 60px;
  text-align: center;

  p {
    margin-top: 10px;

    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;

    color: var(--color-content-text);
  }
`;
