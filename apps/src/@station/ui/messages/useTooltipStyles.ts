import { TooltipStylesNames } from '@mantine/core';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';

export const useTooltipStyles = createMantineStyles<TooltipStylesNames>({
  root: {
    fontSize: 0,
    lineHeight: 1,
  },
  body: {
    backgroundColor: 'var(--color-content-text)',
    color: 'var(--color-content-background)',
    fontSize: 12,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  arrow: {
    backgroundColor: 'var(--color-content-text)',
  },
});
