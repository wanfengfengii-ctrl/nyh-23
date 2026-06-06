import React from 'react';
import { Box, Typography } from '@mui/material';

export interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  divider?: boolean;
  labelWidth?: string | number;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  multiline = false,
  divider = true,
  labelWidth = 'auto',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        py: 1,
        borderBottom: divider ? '1px dashed' : 'none',
        borderColor: 'divider',
        gap: 2,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          flexShrink: 0,
          width: labelWidth,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          textAlign: 'right',
          flex: 1,
          whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value !== undefined && value !== null && value !== '' ? value : '-'}
      </Typography>
    </Box>
  );
};

export default InfoRow;
