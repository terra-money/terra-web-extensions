import React, { memo, NamedExoticComponent } from 'react';

export interface DonutIconProps {
  ratio: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function propsAreEqual(prev: DonutIconProps, next: DonutIconProps): boolean {
  return prev === next;
}

export const DonutIcon: NamedExoticComponent<DonutIconProps> = memo(function ({
  ratio,
  size = 24,
  strokeWidth = 5,
  color = 'currentColor',
}: DonutIconProps) {
  const halfsize = size * 0.5;
  const radius = halfsize - strokeWidth * 0.5;
  const circumference = 2 * Math.PI * radius;
  const strokeval = Math.max(Math.min(ratio, 1), 0) * circumference;
  const dashval = strokeval + ' ' + circumference;

  const trackstyle = {
    strokeWidth: strokeWidth,
    fill: 'transparent',
    stroke: color,
    opacity: 0.3,
  };

  const indicatorstyle = {
    strokeWidth: strokeWidth,
    strokeDasharray: dashval,
    fill: 'transparent',
    stroke: color,
  };

  const rotateval = 'rotate(-90 ' + halfsize + ',' + halfsize + ')';

  return (
    <svg width={size} height={size}>
      <circle
        r={radius}
        cx={halfsize}
        cy={halfsize}
        transform={rotateval}
        style={trackstyle}
        fill="transparent"
      />
      <circle
        r={radius}
        cx={halfsize}
        cy={halfsize}
        transform={rotateval}
        style={indicatorstyle}
      />
    </svg>
  );
},
propsAreEqual);
