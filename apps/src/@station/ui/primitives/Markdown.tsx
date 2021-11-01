import marked from 'marked';
import React, { useMemo } from 'react';

export interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  const html = useMemo(() => {
    return marked(children);
  }, [children]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
