import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import type { StatusColor } from '../../types/base';

export interface StatusBadgeProps extends Omit<ChipProps, 'color' | 'label'> {
  label: string;
  color?: StatusColor;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color = 'default',
  variant = 'filled',
  size = 'small',
  sx,
  ...rest
}) => {
  return (
    <Chip
      label={label}
      color={color as ChipProps['color']}
      variant={variant}
      size={size}
      sx={{
        fontWeight: 500,
        ...sx,
      }}
      {...rest}
    />
  );
};

export default StatusBadge;
