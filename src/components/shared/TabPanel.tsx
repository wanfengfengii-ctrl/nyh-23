import React from 'react';
import { Box } from '@mui/material';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  padding?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  padding = '16px 24px 24px',
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ padding }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default TabPanel;
