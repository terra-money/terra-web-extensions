import { truncate } from '@libs/formatter';
import { Tooltip, TooltipStylesNames } from '@mantine/core';
import { WalletIcon } from '@station/ui2/wallet-cards/WalletIcon';
import { fixHMR } from 'fix-hmr';
import React, {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  useMemo,
} from 'react';
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
  design: 'terra' | 'anchor' | 'mirror' | string;
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

function matchDesign(design: string): {
  icon: ReactNode;
  style: CSSProperties;
} {
  switch (design) {
    case 'terra':
      return {
        icon: <WalletIcon design="terra" />,
        style: {
          backgroundColor: '#2043b5',
          color: '#ffffff',
        },
      };
    case 'anchor':
      return {
        icon: <WalletIcon design="anchor" />,
        style: {
          backgroundColor: '#4bdb4b',
          color: '#1e1e1e',
        },
      };
    case 'mirror':
      return {
        icon: <WalletIcon design="mirror" />,
        style: {
          backgroundColor: '#1db1ff',
          color: '#010f3d',
        },
      };
  }

  return {
    icon: <WalletIcon design={design} />,
    style: {
      backgroundColor: design,
      color: '#ffffff',
    },
  };
}

function Component({
  name,
  terraAddress,
  children,
  showCopyTerraAddress,
  onShowQRCode,
  design,
  style: _style,
  ...divProps
}: WalletCardProps) {
  const { classes: tooltipClasses } = useTooltipStyles();

  const [isCopied, setCopied] = useClipboard(terraAddress, {
    successDuration: 1000,
  });

  const { icon, style } = useMemo(() => {
    return matchDesign(design);
  }, [design]);

  return (
    <div {...divProps} style={{ ..._style, ...style }}>
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
          {typeof onShowQRCode === 'function' && (
            <MdQrCode2 onClick={() => onShowQRCode(terraAddress)} />
          )}
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

    svg {
      width: 30px;
      height: 30px;
    }
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
