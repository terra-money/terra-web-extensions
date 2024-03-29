/// <reference types="vite/client" />
/// <reference types="@rocket-scripts/react-preset/typings"/>

declare module '*.svg' {
  import React from 'react';
  const content: string & {
    ReactComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  export = content;
}

declare module '*.mdx' {
  import React from 'react';
  const component: React.ComponentType<{}>;
  export = component;
}
