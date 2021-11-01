import { SvgIcon, TerraIcon } from '@station/ui';
import { createElement } from 'react';

export const LOGO = createElement(SvgIcon, {
  width: 20,
  height: 20,
  children: createElement(TerraIcon),
});

export const MODAL_WIDTH = 450;
