import { Button } from '@material-ui/core';
import { FormLayout, Layout } from '@station/ui';
import React from 'react';

export interface UnknownCaseProps {
  className?: string;
  detail: string;
  onConfirm?: () => void;
}

export function UnknownCase({
  className,
  detail,
  onConfirm,
}: UnknownCaseProps) {
  return (
    <Layout>
      <FormLayout>
        <h3>Error</h3>
        <p>{detail}</p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </footer>
    </Layout>
  );
}
