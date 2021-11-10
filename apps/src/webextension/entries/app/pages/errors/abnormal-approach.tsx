import { Button, DonutIcon } from '@station/ui';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { ViewCenterLayout } from 'webextension/components/views/components/ViewCenterLayout';

export function AbnormalApproach() {
  return (
    <SubLayout title="Abnormal approach" rightSection={<DonutIcon ratio={0} />}>
      <ViewCenterLayout
        icon={<MdMoodBad />}
        title="Disallow this approach"
        footer={
          <Button variant="primary" size="large" onClick={() => window.close()}>
            Close
          </Button>
        }
      />
    </SubLayout>
  );
}
