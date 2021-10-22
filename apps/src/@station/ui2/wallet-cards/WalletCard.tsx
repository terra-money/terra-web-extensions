import { truncate } from '@libs/formatter';
import { Tooltip, TooltipStylesNames } from '@mantine/core';
import { fixHMR } from 'fix-hmr';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { MdOutlineFilterNone, MdQrCode2 } from 'react-icons/md';
import useClipboard from 'react-use-clipboard';
import styled from 'styled-components';
import { createMantineStyles } from '../mantine-utils/createMantineStyles';

export interface WalletCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  name: string;
  terraAddress: string;
  showCopyTerraAddress?: boolean;
  onShowQRCode?: (terraAddress: string) => void;
  icon?: ReactNode;
}

const useTooltipStyles = createMantineStyles<TooltipStylesNames>({
  root: {
    fontSize: 0,
    lineHeight: 1,
  },
  body: {
    backgroundColor: 'var(--color-content-background)',
    color: 'var(--color-content-text)',
    fontSize: 12,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  arrow: {
    backgroundColor: 'var(--color-content-background)',
  },
});

function Component({
  name,
  terraAddress,
  icon,
  children,
  showCopyTerraAddress,
  onShowQRCode,
  ...divProps
}: WalletCardProps) {
  const { classes: tooltipClasses } = useTooltipStyles();

  const [isCopied, setCopied] = useClipboard(terraAddress, {
    successDuration: 1000 * 5,
  });

  return (
    <div {...divProps}>
      <div className="icon">{icon}</div>

      <div className="info">
        <h3>{name}</h3>
        <footer>
          <span>{truncate(terraAddress, [12, 10])}</span>
          {showCopyTerraAddress && (
            <Tooltip
              label="Copied"
              withArrow
              arrowSize={3}
              opened={isCopied}
              classNames={tooltipClasses}
            >
              <MdOutlineFilterNone
                style={{ transform: 'scale(0.9)' }}
                onClick={setCopied}
              />
            </Tooltip>
          )}
          {typeof onShowQRCode === 'function' && <MdQrCode2 />}
        </footer>
      </div>

      <div className="more">{children}</div>
    </div>
  );
}

const StyledComponent = styled(Component)`
  position: relative;

  background-color: red;
  color: white;

  border-radius: 16px;

  .icon {
    position: absolute;
    left: 20px;
    top: 20px;
  }

  .info {
    position: absolute;
    left: 20px;
    bottom: 20px;

    line-height: 1.5;

    h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    footer {
      font-size: 12px;

      display: flex;
      align-items: center;
      gap: 5px;

      svg {
        cursor: pointer;
        font-size: 12px;
      }
    }
  }

  .more {
    position: absolute;
    right: 15px;
    top: 20px;
  }
`;

export const WalletCard = fixHMR(StyledComponent);
