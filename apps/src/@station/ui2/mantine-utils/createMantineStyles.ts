import { createStyles, CSSObject, MantineTheme } from '@mantine/core';

export function createMantineStyles<StyleName extends string, Params = void>(
  getCssObjectOrCssObject:
    | ((
        theme: MantineTheme,
        params: Params,
        createRef: (refName: string) => string,
      ) => Partial<Record<StyleName, CSSObject>>)
    | Partial<Record<StyleName, CSSObject>>,
): (params: Params) => { classes: Partial<Record<StyleName, string>> } {
  return createStyles(getCssObjectOrCssObject as any) as any;
}
