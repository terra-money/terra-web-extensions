import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';

export interface UIPreviewProps {
  className?: string;
}

function UIPreviewBase({ className }: UIPreviewProps) {
  return <div className={className}>UIPreview</div>;
}

export const StyledUIPreview = styled(UIPreviewBase)`
  // TODO
`;

export const UIPreview = fixHMR(StyledUIPreview);
