import { SvgIcon } from '@station/ui2';
import { createElement } from 'react';
import { TerraIcon } from 'webextension/assets';

export const LOGO = createElement(SvgIcon, {
  width: 20,
  height: 20,
  children: createElement(TerraIcon),
});

export const MODAL_WIDTH = 450;
