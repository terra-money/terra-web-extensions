import { ReactNode } from 'react';
import error100 from './errors/100';

export const ledgerErrorGuides: { [code: number]: ReactNode } = {
  100: error100,
};
