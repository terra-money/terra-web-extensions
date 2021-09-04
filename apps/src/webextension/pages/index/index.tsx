import { fixHMR } from 'fix-hmr';
import React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider } from 'webextension/contexts/locales';

export interface IndexProps {
  className?: string;
}

function IndexBase({ className }: IndexProps) {
  return <div className={className}>Index</div>;
}

export const StyledIndex = styled(IndexBase)`
  // TODO
`;

export const Index = fixHMR(StyledIndex);

render(
  <ErrorBoundary>
    <LocalesProvider>
      <Index />
    </LocalesProvider>
  </ErrorBoundary>,
  document.querySelector('#app'),
);
